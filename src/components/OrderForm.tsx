import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, ChevronRight, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderFormProps {
  selectedItems?: OrderItem[];
  onSubmitOrder?: (orderData: any) => void;
}

const OrderForm = ({
  selectedItems = [],
  onSubmitOrder = () => {},
}: OrderFormProps) => {
  const [step, setStep] = useState<number>(1);
  const [items, setItems] = useState<OrderItem[]>(
    selectedItems.length
      ? selectedItems
      : [
          { id: "1", name: "Gourmet Burger", price: 12.99, quantity: 1 },
          { id: "2", name: "Loaded Fries", price: 7.99, quantity: 1 },
        ],
  );
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    specialInstructions: "",
  });
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = deliveryOption === "delivery" ? 5.99 : 0;
  const total = subtotal + tax + deliveryFee - promoDiscount;

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handlePromoCode = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === "FOODTRUCK10") {
      setPromoDiscount(subtotal * 0.1); // 10% discount
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === "FREESHIP") {
      setPromoDiscount(deliveryFee);
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const handleSubmitOrder = () => {
    const orderData = {
      items,
      contactInfo,
      deliveryOption,
      deliveryAddress: deliveryOption === "delivery" ? deliveryAddress : null,
      promoCode: promoApplied ? promoCode : null,
      subtotal,
      tax,
      deliveryFee,
      promoDiscount,
      total,
      orderDate: new Date().toISOString(),
    };

    onSubmitOrder(orderData);
    setOrderComplete(true);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="w-full max-w-3xl mx-auto bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Place Your Order</CardTitle>
          <CardDescription>
            Complete the steps below to submit your food order
          </CardDescription>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                1
              </div>
              <div className="ml-2 text-sm font-medium">Review Items</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                2
              </div>
              <div className="ml-2 text-sm font-medium">Contact Info</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                3
              </div>
              <div className="ml-2 text-sm font-medium">Confirm</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {orderComplete ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Order Submitted!</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for your order. We'll be in touch shortly.
              </p>
              <Button
                onClick={() => {
                  setStep(1);
                  setOrderComplete(false);
                  setItems([
                    {
                      id: "1",
                      name: "Gourmet Burger",
                      price: 12.99,
                      quantity: 1,
                    },
                    { id: "2", name: "Loaded Fries", price: 7.99, quantity: 1 },
                  ]);
                  setContactInfo({
                    name: "",
                    email: "",
                    phone: "",
                    specialInstructions: "",
                  });
                  setDeliveryOption("pickup");
                  setPromoCode("");
                  setPromoApplied(false);
                  setPromoDiscount(0);
                }}
              >
                Place Another Order
              </Button>
            </div>
          ) : (
            <Tabs value={`step-${step}`} className="w-full">
              <TabsContent
                value="step-1"
                className={step === 1 ? "block" : "hidden"}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Your Order Items</h3>

                  {items.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your cart is empty. Please add items to continue.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="pt-4">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={nextStep} disabled={items.length === 0}>
                    Continue to Contact Info
                  </Button>
                </div>
              </TabsContent>

              <TabsContent
                value="step-2"
                className={step === 2 ? "block" : "hidden"}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={contactInfo.name}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            name: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            email: e.target.value,
                          })
                        }
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            phone: e.target.value,
                          })
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="instructions">Special Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={contactInfo.specialInstructions}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            specialInstructions: e.target.value,
                          })
                        }
                        placeholder="Allergies, preferences, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <h3 className="text-lg font-medium">Delivery Options</h3>

                    <RadioGroup
                      value={deliveryOption}
                      onValueChange={setDeliveryOption}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Pickup (Free)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">Delivery ($5.99)</Label>
                      </div>
                    </RadioGroup>

                    {deliveryOption === "delivery" && (
                      <div className="grid gap-4 mt-4">
                        <div className="grid gap-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={deliveryAddress.street}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                street: e.target.value,
                              })
                            }
                            placeholder="123 Main St"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={deliveryAddress.city}
                              onChange={(e) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  city: e.target.value,
                                })
                              }
                              placeholder="Anytown"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <Select
                              value={deliveryAddress.state}
                              onValueChange={(value) =>
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  state: value,
                                })
                              }
                            >
                              <SelectTrigger id="state">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CA">California</SelectItem>
                                <SelectItem value="NY">New York</SelectItem>
                                <SelectItem value="TX">Texas</SelectItem>
                                <SelectItem value="FL">Florida</SelectItem>
                                <SelectItem value="IL">Illinois</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={deliveryAddress.zip}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                zip: e.target.value,
                              })
                            }
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={
                      !contactInfo.name ||
                      !contactInfo.email ||
                      !contactInfo.phone ||
                      (deliveryOption === "delivery" &&
                        (!deliveryAddress.street ||
                          !deliveryAddress.city ||
                          !deliveryAddress.state ||
                          !deliveryAddress.zip))
                    }
                  >
                    Review Order
                  </Button>
                </div>
              </TabsContent>

              <TabsContent
                value="step-3"
                className={step === 3 ? "block" : "hidden"}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      {deliveryOption === "delivery" && (
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      {promoApplied && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Promo Discount</span>
                          <span>-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {contactInfo.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {contactInfo.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {contactInfo.phone}
                      </p>
                      {contactInfo.specialInstructions && (
                        <p>
                          <span className="font-medium">
                            Special Instructions:
                          </span>{" "}
                          {contactInfo.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Delivery Method
                    </h3>
                    <Badge
                      variant={
                        deliveryOption === "pickup" ? "secondary" : "default"
                      }
                    >
                      {deliveryOption === "pickup" ? "Pickup" : "Delivery"}
                    </Badge>

                    {deliveryOption === "delivery" && (
                      <div className="mt-2">
                        <p>{deliveryAddress.street}</p>
                        <p>
                          {deliveryAddress.city}, {deliveryAddress.state}{" "}
                          {deliveryAddress.zip}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Promo Code</h3>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button onClick={handlePromoCode} variant="outline">
                        Apply
                      </Button>
                    </div>
                    {promoApplied && (
                      <p className="text-green-600 text-sm mt-2">
                        Promo code applied successfully!
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={handleSubmitOrder}>Submit Order</Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Questions? Call us at (555) 123-4567
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderForm;
