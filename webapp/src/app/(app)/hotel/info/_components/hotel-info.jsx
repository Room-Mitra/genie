"use client";

import { EmailIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { useEffect, useMemo, useState } from "react";
import { HotelIcon, MapPin, PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Spinner } from "@material-tailwind/react";

async function getHotelInfo() {
  const res = await fetch("/api/hotel", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch hotel");
  return await res.json();
}

async function saveHotelInfo({ name, contactPhone, contactEmail, address }) {
  const res = await fetch(`/api/hotel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, contactPhone, contactEmail, address }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save hotel info");
  }

  return res.json();
}

export function HotelInfoForm() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelName, setHotelName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [savingHotel, setSavingHotel] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getHotelInfo();
        setHotel(res);
        setHotelName(res.name);
        setContactPhone(res.contactPhone);
        setContactEmail(res.contactEmail);
        setAddress(res.address);
      } catch (err) {
        toast.error(err?.message || "Error fetching hotel info");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      hotelName &&
      contactPhone &&
      contactEmail &&
      address &&
      (hotelName != hotel?.name ||
        contactPhone != hotel?.contactPhone ||
        contactEmail != hotel?.contactEmail ||
        address != hotel?.address) &&
      !savingHotel
    );
  }, [hotelName, contactPhone, contactEmail, address, savingHotel, hotel]);

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    setSavingHotel(true);

    if (!hotelName || !contactPhone || !contactEmail || !address) {
      toast.error(
        "Hotel name, contact phone, contact email and address required",
      );
      setSavingHotel(false);
      return;
    }

    try {
      const res = await saveHotelInfo({
        name: hotelName,
        contactPhone,
        contactEmail,
        address,
      });

      setHotel(res);

      toast.success("Saved hotel info");
    } catch (error) {
      toast.error(error.message || "Failed to save hotel info");
    } finally {
      setSavingHotel(false);
    }
  };

  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      {loading ? (
        <div className="mx-auto my-5 w-fit">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSaveHotel} className="grid grid-cols-1 gap-5">
          <InputGroup
            type="text"
            name="name"
            label="Hotel Name"
            placeholder="The Best Exotic Marigold Hotel"
            required
            icon={<HotelIcon />}
            iconPosition="left"
            handleChange={(e) => setHotelName(e.target.value)}
            value={hotelName}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputGroup
              type="tel"
              name="mobile"
              label="Contact Phone"
              placeholder="9910203040"
              value={contactPhone}
              handleChange={(e) =>
                setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              icon={<PhoneIcon />}
              iconPosition="left"
              required
            />

            <InputGroup
              type="email"
              name="email"
              label="Contact Email"
              placeholder="kiran.kumar@hotel.com"
              icon={<EmailIcon />}
              iconPosition="left"
              required
              handleChange={(e) => setContactEmail(e.target.value)}
              value={contactEmail}
            />
          </div>

          <InputGroup
            required
            type="text"
            name="address"
            label="Address"
            placeholder="145, 18th Main, Jayanagar, Bangalore, KA 560011"
            icon={<MapPin />}
            iconPosition="left"
            handleChange={(e) => setAddress(e.target.value)}
            value={address}
          />

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium",
                !canSubmit
                  ? "bg-gray-700 text-gray-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500",
              )}
              disabled={!canSubmit}
            >
              {savingHotel ? "Saving..." : "Save hotel"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
