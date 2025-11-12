"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EditStaffPanel } from "./editSidePanel";

export function EditPanelPortal(props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!props.open || !props.staffUser) return null;

  return createPortal(<EditStaffPanel {...props} />, document.body);
}
