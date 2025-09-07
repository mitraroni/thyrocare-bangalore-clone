"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const AppointmentForm = () => {
  return (
    <section id="bookingForm" className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xl md:text-2xl text-muted-foreground">Fill the Form &amp;</p>
          <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground mt-1">
            Book Your Appointment Now
          </h2>
        </div>

        <div className="max-w-3xl mx-auto bg-muted p-6 sm:p-8 rounded-lg">
          <form className="space-y-6">
            <div>
              <h5 className="text-lg font-bold text-accent-foreground mb-4">Contact Details</h5>
              <div>
                <Label htmlFor="mobile" className="text-sm font-medium text-muted-foreground">
                  Mobile Number*
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  className="mt-1 bg-white border-border"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <h5 className="text-lg font-bold text-accent-foreground mb-4">Personal Details</h5>
              <div>
                <Label htmlFor="patientName" className="text-sm font-medium text-muted-foreground">
                  Patient Name*
                </Label>
                <Input
                  id="patientName"
                  type="text"
                  className="mt-1 bg-white border-border"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <h5 className="text-lg font-bold text-accent-foreground mb-4">Appointment Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <Label htmlFor="appointmentDate" className="text-sm font-medium text-muted-foreground">
                    Appointment Date*
                  </Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    className="mt-1 bg-white border-border"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2.5">
                    Appointment Slot*
                  </Label>
                  <RadioGroup defaultValue="morning" className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="morning" id="r_morning" />
                      <Label htmlFor="r_morning" className="font-normal text-sm text-foreground">
                        Morning
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afternoon" id="r_afternoon" />
                      <Label htmlFor="r_afternoon" className="font-normal text-sm text-foreground">
                        Afternoon
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="evening" id="r_evening" />
                      <Label htmlFor="r_evening" className="font-normal text-sm text-foreground">
                        Evening
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4">
              <Checkbox id="dnd" className="mt-0.5" />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="dnd"
                  className="text-xs text-muted-foreground font-normal cursor-pointer"
                >
                  I authorise Thyrocare representative to contact me. I understand that this will override the DND status on my mobile number.
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full text-lg font-semibold h-12">
              Confirm Appointment
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AppointmentForm;