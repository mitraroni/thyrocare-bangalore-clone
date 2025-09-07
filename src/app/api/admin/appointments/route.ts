import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single appointment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const appointment = await db.select()
        .from(appointments)
        .where(eq(appointments.id, parseInt(id)))
        .limit(1);

      if (appointment.length === 0) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      return NextResponse.json(appointment[0]);
    }

    // List appointments with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const appointmentDate = searchParams.get('appointment_date');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(appointments);
    let conditions = [];

    // Search across patientName and mobileNumber
    if (search) {
      const searchCondition = or(
        like(appointments.patientName, `%${search}%`),
        like(appointments.mobileNumber, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Filter by status
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      conditions.push(eq(appointments.status, status));
    }

    // Filter by appointment date
    if (appointmentDate) {
      conditions.push(eq(appointments.appointmentDate, appointmentDate));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = sort === 'appointmentDate' ? appointments.appointmentDate :
                      sort === 'patientName' ? appointments.patientName :
                      sort === 'status' ? appointments.status :
                      appointments.createdAt;

    query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();
    const { patientName, mobileNumber, appointmentDate, appointmentSlot, status, dndAuthorized } = requestBody;

    // Validate required fields
    if (!patientName) {
      return NextResponse.json({ 
        error: "Patient name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!mobileNumber) {
      return NextResponse.json({ 
        error: "Mobile number is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!appointmentDate) {
      return NextResponse.json({ 
        error: "Appointment date is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!appointmentSlot) {
      return NextResponse.json({ 
        error: "Appointment slot is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate appointment slot
    if (!['morning', 'afternoon', 'evening'].includes(appointmentSlot)) {
      return NextResponse.json({ 
        error: "Appointment slot must be one of: morning, afternoon, evening",
        code: "INVALID_APPOINTMENT_SLOT" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: "Status must be one of: pending, confirmed, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      patientName: patientName.trim(),
      mobileNumber: mobileNumber.trim(),
      appointmentDate: appointmentDate.trim(),
      appointmentSlot: appointmentSlot.trim(),
      status: status ? status.trim() : 'pending',
      dndAuthorized: dndAuthorized || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newAppointment = await db.insert(appointments)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newAppointment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { patientName, mobileNumber, appointmentDate, appointmentSlot, status, dndAuthorized } = requestBody;

    // Check if appointment exists
    const existingAppointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Validate appointment slot if provided
    if (appointmentSlot && !['morning', 'afternoon', 'evening'].includes(appointmentSlot)) {
      return NextResponse.json({ 
        error: "Appointment slot must be one of: morning, afternoon, evening",
        code: "INVALID_APPOINTMENT_SLOT" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: "Status must be one of: pending, confirmed, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Build update data with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (patientName !== undefined) updateData.patientName = patientName.trim();
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber.trim();
    if (appointmentDate !== undefined) updateData.appointmentDate = appointmentDate.trim();
    if (appointmentSlot !== undefined) updateData.appointmentSlot = appointmentSlot.trim();
    if (status !== undefined) updateData.status = status.trim();
    if (dndAuthorized !== undefined) updateData.dndAuthorized = dndAuthorized;

    const updatedAppointment = await db.update(appointments)
      .set(updateData)
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    if (updatedAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAppointment[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if appointment exists
    const existingAppointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const deletedAppointment = await db.delete(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    if (deletedAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully',
      appointment: deletedAppointment[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}