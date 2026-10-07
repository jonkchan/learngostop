"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="fixed right-[18px] bottom-[18px] cursor-pointer rounded-full bg-hred px-[18px] py-[10px] text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.3)] print:hidden"
    >
      Print
    </button>
  );
}
