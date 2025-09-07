"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Phone, Mail, Fax, Plus, Search, Filter, Trash2, Edit, MoreHorizontal, Eye, EyeOff, Users, Loader2, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface FooterContact {
  id: number;
  contactType: "phone" | "email" | "fax";
  contactValue: string;
  label: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactFormData {
  contactType: "phone" | "email" | "fax";
  contactValue: string;
  label: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminFooterContactsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  const [contacts, setContacts] = useState<FooterContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<FooterContact | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const [formData, setFormData] = useState<ContactFormData>({
    contactType: "phone",
    contactValue: "",
    label: "",
    isActive: true,
    displayOrder: 0,
  });

  // Statistics
  const totalContacts = contacts.length;
  const phoneContacts = contacts.filter(c => c.contactType === "phone").length;
  const emailContacts = contacts.filter(c => c.contactType === "email").length;
  const faxContacts = contacts.filter(c => c.contactType === "fax").length;
  const activeContacts = contacts.filter(c => c.isActive).length;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/admin/footer-contacts", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchContacts();
    }
  }, [session]);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.contactValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.label.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || contact.contactType === selectedType;
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "active" && contact.isActive) ||
      (selectedStatus === "inactive" && !contact.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getContactIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "fax":
        return <Fax className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const formatContactValue = (type: string, value: string) => {
    switch (type) {
      case "phone":
        return `+91 ${value}`;
      case "fax":
        return value;
      case "email":
      default:
        return value;
    }
  };

  const validateForm = (): boolean => {
    if (!formData.contactValue.trim()) {
      toast.error("Contact value is required");
      return false;
    }

    if (!formData.label.trim()) {
      toast.error("Label is required");
      return false;
    }

    if (formData.contactType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactValue)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const token = localStorage.getItem("bearer_token");
      const url = editingContact 
        ? `/api/admin/footer-contacts?id=${editingContact.id}`
        : "/api/admin/footer-contacts";
      
      const method = editingContact ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save contact");
      }

      toast.success(editingContact ? "Contact updated successfully" : "Contact created successfully");
      setIsFormOpen(false);
      setEditingContact(null);
      resetForm();
      fetchContacts();
    } catch (error: any) {
      console.error("Error saving contact:", error);
      toast.error(error.message || "Failed to save contact");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (contact: FooterContact) => {
    setEditingContact(contact);
    setFormData({
      contactType: contact.contactType,
      contactValue: contact.contactValue,
      label: contact.label,
      isActive: contact.isActive,
      displayOrder: contact.displayOrder,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(id);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/admin/footer-contacts?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      toast.success("Contact deleted successfully");
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true);
      const token = localStorage.getItem("bearer_token");
      
      await Promise.all(
        selectedContacts.map(id =>
          fetch(`/api/admin/footer-contacts?id=${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
        )
      );

      toast.success(`${selectedContacts.length} contacts deleted successfully`);
      setSelectedContacts([]);
      fetchContacts();
    } catch (error) {
      console.error("Error bulk deleting contacts:", error);
      toast.error("Failed to delete selected contacts");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const toggleContactStatus = async (contact: FooterContact) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/admin/footer-contacts?id=${contact.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...contact,
          isActive: !contact.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact status");
      }

      toast.success(`Contact ${!contact.isActive ? "activated" : "deactivated"} successfully`);
      fetchContacts();
    } catch (error) {
      console.error("Error updating contact status:", error);
      toast.error("Failed to update contact status");
    }
  };

  const resetForm = () => {
    setFormData({
      contactType: "phone",
      contactValue: "",
      label: "",
      isActive: true,
      displayOrder: 0,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, id]);
    } else {
      setSelectedContacts(prev => prev.filter(contactId => contactId !== id));
    }
  };

  // Show loading skeleton while checking authentication
  if (isPending || (loading && contacts.length === 0)) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Footer Contacts</h1>
          <p className="text-gray-600 mt-1">Manage footer contact information</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingContact(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </DialogTitle>
                <DialogDescription>
                  {editingContact ? "Update the contact information below." : "Fill in the contact information below."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactType">Contact Type</Label>
                  <Select
                    value={formData.contactType}
                    onValueChange={(value: "phone" | "email" | "fax") =>
                      setFormData(prev => ({ ...prev, contactType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="fax">Fax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactValue">Contact Value</Label>
                  <Input
                    id="contactValue"
                    type={formData.contactType === "email" ? "email" : "text"}
                    placeholder={
                      formData.contactType === "phone" ? "Enter phone number" :
                      formData.contactType === "email" ? "Enter email address" :
                      "Enter fax number"
                    }
                    value={formData.contactValue}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, contactValue: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    placeholder="Enter label/description"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, label: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    placeholder="Enter display order"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isActive: !!checked }))
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingContact(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingContact ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Numbers</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phoneContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Addresses</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fax Numbers</CardTitle>
            <Fax className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faxContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContacts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="fax">Fax</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {selectedContacts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={bulkDeleteLoading}>
                    {bulkDeleteLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete Selected ({selectedContacts.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedContacts.length} selected contacts? This action cannot be undone.
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
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedType !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first contact."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedContacts.length === filteredContacts.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getContactIcon(contact.contactType)}
                        <Badge variant="outline" className="capitalize">
                          {contact.contactType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatContactValue(contact.contactType, contact.contactValue)}
                    </TableCell>
                    <TableCell>{contact.label}</TableCell>
                    <TableCell>
                      <Badge variant={contact.isActive ? "default" : "secondary"}>
                        {contact.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{contact.displayOrder}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(contact)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleContactStatus(contact)}>
                            {contact.isActive ? (
                              <><EyeOff className="mr-2 h-4 w-4" />Deactivate</>
                            ) : (
                              <><Eye className="mr-2 h-4 w-4" />Activate</>
                            )}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{contact.label}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(contact.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteLoading === contact.id}
                                >
                                  {deleteLoading === contact.id && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  )}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}