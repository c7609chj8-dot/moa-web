"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PopupSettings } from "@/lib/site-settings";

export default function PopupNotice({ popup }: { popup: PopupSettings }) {
  const [open, setOpen] = useState(false);
  const dismissalKey = useMemo(() => {
    const today = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
    }).format(new Date());
    return `korea-safety-popup:${today}:${popup.title}`;
  }, [popup.title]);

  useEffect(() => {
    if (!popup.enabled || localStorage.getItem(dismissalKey)) return;
    const timer = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [dismissalKey, popup.enabled]);

  function hideToday() {
    localStorage.setItem(dismissalKey, "hidden");
    setOpen(false);
  }

  if (!popup.enabled || !popup.title || !popup.text) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="noticePopup">
        <DialogHeader>
          <small>한국안전교육 공지</small>
          <DialogTitle>{popup.title}</DialogTitle>
          <DialogDescription>{popup.text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button type="button" className="hideToday" onClick={hideToday}>
            오늘 하루 보지 않기
          </button>
          <DialogClose asChild>
            <button type="button" className="closePopup">
              닫기
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
