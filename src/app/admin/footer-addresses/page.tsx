"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Search, Edit, Trash2, MapPin, Filter, MoreHorizontal, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface FooterAddress {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AddressFormData {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isActive: boolean;
  displayOrder: number;
}

const initialFormData: AddressFormData = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isActive: true,
  displayOrder: 0,
};

export default function FooterAddressesManagement() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<FooterAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<FooterAddress | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Statistics
  const totalAddresses = addresses.length;
  const activeAddresses = addresses.filter(addr => addr.isActive).length;
  const inactiveAddresses = totalAddresses - activeAddresses;

  // Auth check
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/admin/footer-addresses", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Filter addresses
  const filteredAddresses = addresses.filter(address => {
    const matchesSearch = searchTerm === "" || 
      address.addressLine1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.addressLine2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.postalCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && address.isActive) ||
      (statusFilter === "inactive" && !address.isActive);

    return matchesSearch && matchesStatus;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const url = editingAddress 
        ? `/api/admin/footer-addresses?id=${editingAddress.id}`
        : "/api/admin/footer-addresses";
      
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save address");
      }

      toast.success(editingAddress ? "Address updated successfully" : "Address created successfully");
      setIsDialogOpen(false);
      setEditingAddress(null);
      setFormData(initialFormData);
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/admin/footer-addresses?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedAddresses.length === 0) return;

    try {
      const token = localStorage.getItem("bearer_token");
      await Promise.all(
        selectedAddresses.map(id =>
          fetch(`/api/admin/footer-addresses?id=${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
        )
      );

      toast.success(`${selectedAddresses.length} addresses deleted successfully`);
      setSelectedAddresses([]);
      fetchAddresses();
    } catch (error) {
      console.error("Error bulk deleting addresses:", error);
      toast.error("Failed to delete addresses");
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (address: FooterAddress) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/admin/footer-addresses?id=${address.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !address.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Address ${!address.isActive ? "activated" : "deactivated"} successfully`);
      fetchAddresses();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  // Handle edit
  const handleEdit = (address: FooterAddress) => {
    setEditingAddress(address);
    setFormData({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isActive: address.isActive,
      displayOrder: address.displayOrder,
    });
    setIsDialogOpen(true);
  };

  // Handle checkbox selection
  const handleSelectAddress = (id: number, checked: boolean) => {
    setSelectedAddresses(prev =>
      checked ? [...prev, id] : prev.filter(addressId => addressId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedAddresses(checked ? filteredAddresses.map(addr => addr.id) : []);
  };

  // Reset form when dialog closes
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormData(initialFormData);
  };

  // Format full address for display
  const formatFullAddress = (address: FooterAddress) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (isPending || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Footer Address Management</h1>
            <p className="text-muted-foreground">
              Manage footer addresses displayed on your website
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAddress 
                      ? "Update the address information below."
                      : "Fill in the address details to add a new footer address."
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="Postal code"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="Country"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : editingAddress ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAddresses}</div>
              <p className="text-xs text-muted-foreground">
                All footer addresses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Addresses</CardTitle>
              <ToggleRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeAddresses}</div>
              <p className="text-xs text-muted-foreground">
                Currently displayed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Addresses</CardTitle>
              <ToggleLeft className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{inactiveAddresses}</div>
              <p className="text-xs text-muted-foreground">
                Hidden from display
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {selectedAddresses.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedAddresses.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Addresses</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedAddresses.length} selected addresses?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredAddresses.length > 0 && selectedAddresses.length === filteredAddresses.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Full Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAddresses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" ? "No addresses match your filters" : "No addresses found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAddresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAddresses.includes(address.id)}
                          onCheckedChange={(checked) => handleSelectAddress(address.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{address.addressLine1}</div>
                          <div className="text-sm text-muted-foreground">
                            {address.city}, {address.state}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-48 truncate cursor-help">
                                {formatFullAddress(address)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{formatFullAddress(address)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <Badge variant={address.isActive ? "default" : "secondary"}>
                          {address.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{address.displayOrder}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(address)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(address)}
                          >
                            {address.isActive ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Address</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this address? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(address.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}