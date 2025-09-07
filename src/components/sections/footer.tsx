"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, Printer } from "lucide-react";
import { useState, useEffect } from "react";

interface FooterAddress {
  id: number;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  displayOrder: number;
}

interface FooterContact {
  id: number;
  contactType: 'phone' | 'email' | 'fax';
  contactValue: string;
  label: string;
  displayOrder: number;
}

const Footer = () => {
  const [addresses, setAddresses] = useState<FooterAddress[]>([]);
  const [contacts, setContacts] = useState<FooterContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const [addressesResponse, contactsResponse] = await Promise.all([
        fetch('/api/footer-addresses'),
        fetch('/api/footer-contacts')
      ]);

      if (addressesResponse.ok && contactsResponse.ok) {
        const addressesData = await addressesResponse.json();
        const contactsData = await contactsResponse.json();
        
        setAddresses(addressesData);
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone size={16} />;
      case 'email':
        return <Mail size={16} />;
      case 'fax':
        return <Printer size={16} />;
      default:
        return <Phone size={16} />;
    }
  };

  const formatContactValue = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        return `+91-${value}`;
      case 'email':
        return value;
      case 'fax':
        return value;
      default:
        return value;
    }
  };

  const getContactHref = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        return `tel:+91-${value}`;
      case 'email':
        return `mailto:${value}`;
      default:
        return '#';
    }
  };

  const phoneContacts = contacts.filter(contact => contact.contactType === 'phone');

  return (
    <>
      {/* Fixed Contact Widget */}
      <div className="fixed bottom-[110px] left-0 z-10 hidden w-[200px] rounded-r-lg bg-card p-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] md:block">
        <div className="flex flex-col items-center gap-2 text-center">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b8470b16-f278-4267-afa0-8c020026c3ae-thyrocare-com/assets/svgs/logoMb-2.svg?"
            alt="Thyrocare logo"
            width={104}
            height={26}
          />
          <p className="text-xs text-muted-foreground">Teams you can trust</p>
          {phoneContacts.length > 0 && (
            <a
              href={getContactHref(phoneContacts[0].contactType, phoneContacts[0].contactValue)}
              className="flex w-full items-center justify-center gap-2 rounded border border-primary p-2 text-sm font-medium text-primary no-underline hover:no-underline hover:bg-primary/5"
            >
              <Phone size={16} />
              <span>{formatContactValue(phoneContacts[0].contactType, phoneContacts[0].contactValue)}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-14">
          {!loading && (addresses.length > 0 || contacts.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Addresses Section */}
              {addresses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Our Locations
                  </h3>
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="text-sm">
                        <p className="font-medium">{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phone Contacts */}
              {phoneContacts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Phone size={20} />
                    Contact Numbers
                  </h3>
                  <div className="space-y-3">
                    {phoneContacts.map((contact) => (
                      <div key={contact.id}>
                        <p className="text-sm font-medium text-muted-foreground">{contact.label}</p>
                        <a
                          href={getContactHref(contact.contactType, contact.contactValue)}
                          className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                        >
                          {getContactIcon(contact.contactType)}
                          <span>{formatContactValue(contact.contactType, contact.contactValue)}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Contacts (Email, Fax) */}
              {contacts.filter(c => c.contactType !== 'phone').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Other Contacts</h3>
                  <div className="space-y-3">
                    {contacts
                      .filter(contact => contact.contactType !== 'phone')
                      .map((contact) => (
                        <div key={contact.id}>
                          <p className="text-sm font-medium text-muted-foreground">{contact.label}</p>
                          <a
                            href={getContactHref(contact.contactType, contact.contactValue)}
                            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                          >
                            {getContactIcon(contact.contactType)}
                            <span>{formatContactValue(contact.contactType, contact.contactValue)}</span>
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Copyright */}
          <div className="border-t border-secondary-foreground/20 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b8470b16-f278-4267-afa0-8c020026c3ae-thyrocare-com/assets/svgs/logo-1.svg?"
                  alt="Thyrocare logo"
                  width={120}
                  height={30}
                  className="filter brightness-0 invert"
                />
                <p className="text-sm">
                  © 2024 Thyrocare. All Rights Reserved
                </p>
              </div>
              
              {/* Quick Contact */}
              {phoneContacts.length > 0 && (
                <a
                  href={getContactHref(phoneContacts[0].contactType, phoneContacts[0].contactValue)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Phone size={16} />
                  <span>{formatContactValue(phoneContacts[0].contactType, phoneContacts[0].contactValue)}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;