// src/components/ui/alert-dialog.tsx
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>>(({ ...props }, ref) => (
 <AlertDialogPrimitive.Overlay
   ref={ref}
   className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
   {...props}
 />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>>(({ ...props }, ref) => (
 <AlertDialogPortal>
   <AlertDialogOverlay />
   <AlertDialogPrimitive.Content
     ref={ref}
     className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg p-6 shadow-lg bg-gray-900 text-white border border-gray-700 w-[95vw] max-w-md"
     {...props}
   />
 </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
 <div className="mb-4" {...props} />
)

const AlertDialogFooter = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
 <div className="mt-6 flex justify-end space-x-2" {...props} />
)

const AlertDialogTitle = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>>(({ ...props }, ref) => (
 <AlertDialogPrimitive.Title
   ref={ref}
   className="text-lg font-semibold"
   {...props}
 />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>>(({ ...props }, ref) => (
 <AlertDialogPrimitive.Description
   ref={ref}
   className="mt-2 text-sm"
   {...props}
 />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Action>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>>(({ ...props }, ref) => (
 <AlertDialogPrimitive.Action ref={ref} {...props} />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Cancel>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>>(({ ...props }, ref) => (
 <AlertDialogPrimitive.Cancel ref={ref} {...props} />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
 AlertDialog,
 AlertDialogTrigger,
 AlertDialogContent,
 AlertDialogHeader,
 AlertDialogFooter,
 AlertDialogTitle,
 AlertDialogDescription,
 AlertDialogAction,
 AlertDialogCancel,
}
