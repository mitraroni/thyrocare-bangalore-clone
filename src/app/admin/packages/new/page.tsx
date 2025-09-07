"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, AlertCircle, DollarSign, Package, FileText, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface FormData {
  name: string;
  description: string;
  test_codes: string;
  test_count: string;
  price: string;
  original_price: string;
  discount_percentage: string;
  is_active: boolean;
}

interface ValidationErrors {
  name?: string;
  test_count?: string;
  price?: string;
  original_price?: string;
  discount_percentage?: string;
}

export default function AddPackagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const continueEditing = searchParams.get('continue') === 'true';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    test_codes: '',
    test_count: '1',
    price: '',
    original_price: '',
    discount_percentage: '',
    is_active: true
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Form validation
  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Package name is required';
    }

    if (!formData.test_count.trim()) {
      newErrors.test_count = 'Test count is required';
    } else {
      const testCount = parseInt(formData.test_count);
      if (isNaN(testCount) || testCount <= 0) {
        newErrors.test_count = 'Test count must be a positive number';
      }
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a valid positive number';
      }
    }

    if (formData.original_price.trim()) {
      const originalPrice = parseFloat(formData.original_price);
      const priceNum = parseFloat(formData.price);
      
      if (isNaN(originalPrice) || originalPrice <= 0) {
        newErrors.original_price = 'Original price must be a valid positive number';
      } else if (!isNaN(priceNum) && originalPrice <= priceNum) {
        newErrors.original_price = 'Original price must be greater than current price';
      }
    }

    if (formData.discount_percentage.trim()) {
      const discountPercentage = parseFloat(formData.discount_percentage);
      
      if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage >= 100) {
        newErrors.discount_percentage = 'Discount percentage must be between 0 and 99';
      }
    }

    return newErrors;
  }, [formData]);

  // Real-time validation
  useEffect(() => {
    const newErrors = validateForm();
    setErrors(newErrors);
  }, [validateForm]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = Object.values(formData).some((value, index) => {
      const initialValues = ['', '', '', '1', '', '', '', true];
      return value !== initialValues[index];
    });
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Price calculations
  const priceCalculations = useMemo(() => {
    const price = parseFloat(formData.price) || 0;
    const originalPrice = parseFloat(formData.original_price) || 0;
    const discountPercentage = parseFloat(formData.discount_percentage) || 0;
    
    const calculatedDiscountPrice = originalPrice > 0 && discountPercentage > 0 
      ? originalPrice * (1 - discountPercentage / 100)
      : 0;
    
    const savings = originalPrice - price;
    const actualDiscountPercentage = originalPrice > 0 ? ((savings / originalPrice) * 100) : 0;
    
    return {
      price,
      originalPrice,
      discountPercentage,
      calculatedDiscountPrice,
      savings,
      actualDiscountPercentage: Math.round(actualDiscountPercentage * 100) / 100,
      hasDiscount: originalPrice > 0 && originalPrice > price
    };
  }, [formData.price, formData.original_price, formData.discount_percentage]);

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (action: 'save' | 'saveAndContinue' | 'saveAndCreate') => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Please login to continue');
        router.push('/login');
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        test_codes: formData.test_codes.trim() || null,
        test_count: parseInt(formData.test_count),
        price: parseFloat(formData.price),
        original_price: formData.original_price.trim() ? parseFloat(formData.original_price) : null,
        discount_percentage: formData.discount_percentage.trim() ? parseFloat(formData.discount_percentage) : null,
        is_active: formData.is_active
      };

      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create package');
      }

      toast.success('Package created successfully!');
      setHasUnsavedChanges(false);

      // Handle different actions
      switch (action) {
        case 'saveAndContinue':
          router.push(`/admin/packages/${result.id}/edit?continue=true`);
          break;
        case 'saveAndCreate':
          // Reset form for new package
          setFormData({
            name: '',
            description: '',
            test_codes: '',
            test_count: '1',
            price: '',
            original_price: '',
            discount_percentage: '',
            is_active: true
          });
          toast.success('Ready to create another package');
          break;
        default:
          router.push('/admin/packages');
      }

    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, router]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      router.push('/admin/packages');
    }
  }, [hasUnsavedChanges, router]);

  const confirmCancel = useCallback(() => {
    setShowUnsavedWarning(false);
    router.push('/admin/packages');
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/packages')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Packages
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Add New Test Package
          </h1>
          <p className="text-gray-600 mt-1">Create a new medical test package with pricing and details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Package Information
              </CardTitle>
              <CardDescription>
                Enter the basic details about the test package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Package Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Complete Blood Count (CBC)"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this package includes and its benefits..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Test Codes and Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test_codes" className="text-sm font-medium">
                    Test Codes
                  </Label>
                  <Textarea
                    id="test_codes"
                    value={formData.test_codes}
                    onChange={(e) => handleInputChange('test_codes', e.target.value)}
                    placeholder="e.g., CBC001, HGB002, RBC003..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Separate multiple test codes with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_count" className="text-sm font-medium">
                    Number of Tests <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="test_count"
                    type="number"
                    min="1"
                    value={formData.test_count}
                    onChange={(e) => handleInputChange('test_count', e.target.value)}
                    placeholder="1"
                    className={errors.test_count ? 'border-red-500' : ''}
                  />
                  {errors.test_count && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.test_count}
                    </p>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
                />
                <div>
                  <Label htmlFor="is_active" className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Active Package
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Active packages are visible to customers on the website
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Information
              </CardTitle>
              <CardDescription>
                Set the price and any discounts for this package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Current Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Original Price */}
                <div className="space-y-2">
                  <Label htmlFor="original_price" className="text-sm font-medium">
                    Original Price (₹)
                  </Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', e.target.value)}
                    placeholder="Optional"
                    className={errors.original_price ? 'border-red-500' : ''}
                  />
                  {errors.original_price && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.original_price}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Enter if this package has a discount
                  </p>
                </div>
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <Label htmlFor="discount_percentage" className="text-sm font-medium">
                  Discount Percentage (%)
                </Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="99"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                  placeholder="Optional"
                  className={errors.discount_percentage ? 'border-red-500' : ''}
                />
                {errors.discount_percentage && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.discount_percentage}
                  </p>
                )}
              </div>

              {/* Price Summary */}
              {priceCalculations.hasDiscount && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium text-green-800">Discount Applied</p>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>Customers save: ₹{priceCalculations.savings.toFixed(2)}</p>
                        <p>Discount percentage: {priceCalculations.actualDiscountPercentage}%</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleSubmit('save')}
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Package
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleSubmit('saveAndContinue')}
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  Save & Continue Editing
                </Button>

                <Button
                  onClick={() => handleSubmit('saveAndCreate')}
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save & Create Another
                </Button>

                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Package Preview</CardTitle>
              <CardDescription>
                How this package will appear to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                  {/* Package Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {formData.name || 'Package Name'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={formData.is_active ? 'default' : 'secondary'} className="text-xs">
                          {formData.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {formData.test_count && (
                          <Badge variant="outline" className="text-xs">
                            {formData.test_count} Test{parseInt(formData.test_count) !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {formData.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {formData.description}
                    </p>
                  )}

                  {/* Test Codes */}
                  {formData.test_codes && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Test Codes:</p>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {formData.test_codes}
                      </p>
                    </div>
                  )}

                  <Separator className="my-3" />

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div>
                      {priceCalculations.hasDiscount ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              ₹{priceCalculations.price.toFixed(0)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{priceCalculations.originalPrice.toFixed(0)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {priceCalculations.actualDiscountPercentage}% OFF
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {formData.price ? `₹${parseFloat(formData.price).toFixed(0)}` : '₹0'}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Details
                      </Button>
                      <Button size="sm" className="text-xs">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">Package Name</p>
                <p className="text-blue-700">Use clear, descriptive names that patients can easily understand</p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-900 mb-1">Pricing Strategy</p>
                <p className="text-green-700">Show original price with discount to highlight savings</p>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900 mb-1">Test Information</p>
                <p className="text-yellow-700">Include test codes and accurate test count for better organization</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Unsaved Changes</h3>
            <p className="text-gray-600 mb-4">
              You have unsaved changes. Are you sure you want to leave without saving?
            </p>
            <div className="flex gap-3">
              <Button onClick={confirmCancel} variant="outline" className="flex-1">
                Leave Without Saving
              </Button>
              <Button 
                onClick={() => setShowUnsavedWarning(false)}
                className="flex-1"
              >
                Continue Editing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}