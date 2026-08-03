"use client"

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useCart } from "./cart-context"
import { trackInitiateCheckout } from "@/lib/fpixel"

export function CartDrawerAr() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, itemCount, subtotal } = useCart()
  const router = useRouter()

  const shipping = 0
  const total = subtotal + shipping

  const handleCheckout = () => {
    trackInitiateCheckout(
      items.map((item) => ({ id: item.id, quantity: item.quantity, price: item.price }))
    )
    setIsOpen(false)
    router.push("/checkout/Ar")
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerContent className="h-full w-full sm:max-w-[440px]" dir="rtl">
        <DrawerHeader className="border-b border-border/50 p-6 py-2.5">
          <DrawerTitle className="font-cairo text-2xl font-semibold">سلة التسوق</DrawerTitle>
          <DrawerDescription>{itemCount} {itemCount === 1 ? 'منتج' : 'منتجات'}</DrawerDescription>
        </DrawerHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-cairo">سلتك فارغة</p>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="mt-4 text-primary hover:underline text-sm font-cairo"
                >
                  متابعة التسوق
                </button>
              </DrawerClose>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-cairo text-base text-foreground mb-1 font-semibold">{item.name}</h3>
                    <p className="text-muted-foreground mb-3 text-sm font-cairo">{item.description}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted boty-transition rounded-l-full"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted boty-transition rounded-r-full"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive boty-transition"
                        aria-label="حذف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-left">
                    <p className="font-medium text-foreground">{item.price * item.quantity} دج</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="border-t border-border/50 p-6 gap-4">
            {/* Summary */}
            <div className="space-y-2 text-sm font-cairo">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span>{subtotal} دج</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>التوصيل</span>
                <span>{shipping === 0 ? 'يُحدد لاحقاً' : `${shipping} دج`}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-foreground pt-2 border-t border-border/50">
                <span>الإجمالي</span>
                <span>{total} دج</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium hover:bg-primary/90 boty-transition font-cairo"
            >
              تأكيد طلبي
            </button>

            <DrawerClose asChild>
              <button
                type="button"
                className="w-full border border-border text-foreground py-4 rounded-full font-medium hover:bg-muted boty-transition font-cairo"
              >
                متابعة التسوق
              </button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
