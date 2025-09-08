"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Minus, Trash2, ArrowLeft, Package, MapPin, Clock, User, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Mock cart context (replace with actual context in real app)
const useCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Complete Health Package",
      testCount: 85,
      price: 2499,
      originalPrice: 3499,
      quantity: 1,
      category: "Comprehensive",
      description: "Complete health checkup with all essential tests"
    },
    {
      id: 2,
      name: "Basic Blood Profile",
      testCount: 25,
      price: 899,
      originalPrice: 1299,
      quantity: 2,
      category: "Basic",
      description: "Essential blood tests for general health monitoring"
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const savings = originalTotal - total;

  return {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    originalTotal,
    savings,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  };
};

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

const timeSlots = [
  "6:00 AM - 8:00 AM",
  "8:00 AM - 10:00 AM", 
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM"
];

export default function CartCheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    streetAddress: '',
    city: '',
    state: '',
    pinCode: '',
    landmark: '',
    preferredDate: '',
    timeSlot: '',
    collectionType: '',
    specialInstructions: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get tomorrow's date for minimum date selection
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Enter valid Indian mobile number";
    
    if (!formData.age) newErrors.age = "Age is required";
    else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) newErrors.age = "Age must be between 1-120";
    
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    
    if (!formData.pinCode.trim()) newErrors.pinCode = "PIN code is required";
    else if (!/^\d{6}$/.test(formData.pinCode)) newErrors.pinCode = "PIN code must be 6 digits";
    
    if (!formData.preferredDate) newErrors.preferredDate = "Preferred date is required";
    if (!formData.timeSlot) newErrors.timeSlot = "Time slot is required";
    if (!formData.collectionType) newErrors.collectionType = "Collection type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Clear cart and redirect to confirmation
      cart.clearCart();
      
      toast.success(`Booking confirmed! Booking ID: ${bookingId}`);
      
      // In real app, redirect to confirmation page with booking details
      router.push(`/booking-confirmation?id=${bookingId}`);
      
    } catch (error) {
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Cart</span>
          </div>

          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some blood test packages to get started
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/blood-tests">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href="/blood-tests" className="text-muted-foreground hover:text-foreground">
            Blood Tests
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Checkout</span>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Review Cart</span>
            </div>
            <div className="w-16 h-0.5 bg-primary"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center text-sm font-medium`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Booking Details</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center text-sm font-medium`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cart Items Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Cart ({cart.itemCount} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.testCount} tests • {item.category}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{item.name}" from your cart?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cart.removeItem(item.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cart.originalTotal}</span>
                </div>
                {cart.savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Savings</span>
                    <span>-₹{cart.savings}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{cart.total}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={errors.fullName ? 'border-destructive' : ''}
                    />
                    {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className={errors.age ? 'border-destructive' : ''}
                    />
                    {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label>Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    className={errors.streetAddress ? 'border-destructive' : ''}
                  />
                  {errors.streetAddress && <p className="text-sm text-destructive mt-1">{errors.streetAddress}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label>State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <Label htmlFor="pinCode">PIN Code *</Label>
                    <Input
                      id="pinCode"
                      value={formData.pinCode}
                      onChange={(e) => handleInputChange('pinCode', e.target.value)}
                      placeholder="6-digit PIN code"
                      className={errors.pinCode ? 'border-destructive' : ''}
                    />
                    {errors.pinCode && <p className="text-sm text-destructive mt-1">{errors.pinCode}</p>}
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Appointment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date *</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      min={getTomorrowDate()}
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      className={errors.preferredDate ? 'border-destructive' : ''}
                    />
                    {errors.preferredDate && <p className="text-sm text-destructive mt-1">{errors.preferredDate}</p>}
                  </div>

                  <div>
                    <Label>Time Slot *</Label>
                    <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange('timeSlot', value)}>
                      <SelectTrigger className={errors.timeSlot ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.timeSlot && <p className="text-sm text-destructive mt-1">{errors.timeSlot}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label>Sample Collection Type *</Label>
                    <Select value={formData.collectionType} onValueChange={(value) => handleInputChange('collectionType', value)}>
                      <SelectTrigger className={errors.collectionType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select collection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Visit (Free)</SelectItem>
                        <SelectItem value="lab">Lab Visit</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.collectionType && <p className="text-sm text-destructive mt-1">{errors.collectionType}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      placeholder="Any special instructions for sample collection..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href="/blood-tests">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment (₹{cart.total})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}