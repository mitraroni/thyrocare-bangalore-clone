"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Shield, CheckCircle, XCircle } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AdminRegisterPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    registrationCode: "",
    termsAccepted: false
  });

  const [validation, setValidation] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    terms: ""
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/admin");
    }
  }, [session, isPending, router]);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >=