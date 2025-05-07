import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  PlusCircle,
  Trash2,
  Edit,
  BarChart3,
  Package,
  Tag,
  Users,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  date: Date;
}

interface Discount {
  id: string;
  code: string;
  amount: number;
  type: "percentage" | "fixed";
  startDate: Date;
  endDate: Date;
  active: boolean;
}

const AdminDashboard = () => {
  // Mock data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Loaded Nachos",
      description:
        "Crispy tortilla chips topped with cheese, jalapeños, and guacamole",
      price: 8.99,
      category: "appetizers",
      image:
        "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80",
    },
    {
      id: "2",
      name: "Gourmet Burger",
      description:
        "Angus beef patty with caramelized onions, bacon, and special sauce",
      price: 12.99,
      category: "mains",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    },
    {
      id: "3",
      name: "Churros",
      description:
        "Fried dough pastry with cinnamon sugar and chocolate dipping sauce",
      price: 6.99,
      category: "desserts",
      image:
        "https://images.unsplash.com/photo-1624743706603-d172d555abe0?w=600&q=80",
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "John Smith",
      customerEmail: "john@example.com",
      items: [
        { menuItemId: "1", name: "Loaded Nachos", quantity: 2, price: 8.99 },
        { menuItemId: "2", name: "Gourmet Burger", quantity: 1, price: 12.99 },
      ],
      total: 30.97,
      status: "pending",
      date: new Date("2023-06-15T14:30:00"),
    },
    {
      id: "ORD-002",
      customerName: "Sarah Johnson",
      customerEmail: "sarah@example.com",
      items: [
        { menuItemId: "2", name: "Gourmet Burger", quantity: 2, price: 12.99 },
        { menuItemId: "3", name: "Churros", quantity: 1, price: 6.99 },
      ],
      total: 32.97,
      status: "confirmed",
      date: new Date("2023-06-16T12:15:00"),
    },
  ]);

  const [discounts, setDiscounts] = useState<Discount[]>([
    {
      id: "1",
      code: "SUMMER10",
      amount: 10,
      type: "percentage",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-08-31"),
      active: true,
    },
    {
      id: "2",
      code: "WELCOME5",
      amount: 5,
      type: "fixed",
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-12-31"),
      active: true,
    },
  ]);

  // State for forms
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
  });

  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    code: "",
    amount: 0,
    type: "percentage",
    startDate: new Date(),
    endDate: new Date(),
    active: true,
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  // Menu management functions
  const handleAddMenuItem = () => {
    if (editingItem) {
      // Update existing item
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...newMenuItem, id: item.id }
            : item,
        ),
      );
    } else {
      // Add new item
      const newItem = {
        ...newMenuItem,
        id: `${menuItems.length + 1}`,
      } as MenuItem;
      setMenuItems([...menuItems, newItem]);
    }
    setNewMenuItem({
      name: "",
      description: "",
      price: 0,
      category: "",
      image: "",
    });
    setEditingItem(null);
    setMenuDialogOpen(false);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewMenuItem({ ...item });
    setMenuDialogOpen(true);
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  // Order management functions
  const handleUpdateOrderStatus = (
    orderId: string,
    status: Order["status"],
  ) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  // Discount management functions
  const handleAddDiscount = () => {
    if (editingDiscount) {
      // Update existing discount
      setDiscounts(
        discounts.map((discount) =>
          discount.id === editingDiscount.id
            ? { ...discount, ...newDiscount, id: discount.id }
            : discount,
        ),
      );
    } else {
      // Add new discount
      const newDiscountItem = {
        ...newDiscount,
        id: `${discounts.length + 1}`,
      } as Discount;
      setDiscounts([...discounts, newDiscountItem]);
    }
    setNewDiscount({
      code: "",
      amount: 0,
      type: "percentage",
      startDate: new Date(),
      endDate: new Date(),
      active: true,
    });
    setEditingDiscount(null);
    setDiscountDialogOpen(false);
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setNewDiscount({ ...discount });
    setDiscountDialogOpen(true);
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(discounts.filter((discount) => discount.id !== id));
  };

  const handleToggleDiscountActive = (id: string) => {
    setDiscounts(
      discounts.map((discount) =>
        discount.id === id
          ? { ...discount, active: !discount.active }
          : discount,
      ),
    );
  };

  // Analytics data (mock)
  const popularItems = [
    { name: "Gourmet Burger", count: 42 },
    { name: "Loaded Nachos", count: 38 },
    { name: "Churros", count: 25 },
  ];

  const peakTimes = [
    { time: "12:00 - 13:00", orders: 28 },
    { time: "18:00 - 19:00", orders: 35 },
    { time: "19:00 - 20:00", orders: 32 },
  ];

  const salesSummary = {
    today: 425.75,
    thisWeek: 2845.5,
    thisMonth: 12350.25,
  };

  return (
    <div className="bg-background p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Welcome, Admin
            </span>
          </div>
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Menu Management
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Order Management
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Discount Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Menu Items</h2>
              <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setNewMenuItem({
                        name: "",
                        description: "",
                        price: 0,
                        category: "",
                        image: "",
                      });
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details for the menu item. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newMenuItem.name}
                        onChange={(e) =>
                          setNewMenuItem({
                            ...newMenuItem,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newMenuItem.description}
                        onChange={(e) =>
                          setNewMenuItem({
                            ...newMenuItem,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={newMenuItem.price}
                        onChange={(e) =>
                          setNewMenuItem({
                            ...newMenuItem,
                            price: parseFloat(e.target.value),
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={newMenuItem.category}
                        onValueChange={(value) =>
                          setNewMenuItem({ ...newMenuItem, category: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appetizers">Appetizers</SelectItem>
                          <SelectItem value="mains">Main Dishes</SelectItem>
                          <SelectItem value="sides">Side Dishes</SelectItem>
                          <SelectItem value="desserts">Desserts</SelectItem>
                          <SelectItem value="drinks">Drinks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image" className="text-right">
                        Image URL
                      </Label>
                      <Input
                        id="image"
                        value={newMenuItem.image}
                        onChange={(e) =>
                          setNewMenuItem({
                            ...newMenuItem,
                            image: e.target.value,
                          })
                        }
                        className="col-span-3"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddMenuItem}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {item.description}
                    </CardDescription>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMenuItem(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Order Management Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Orders</h2>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        {format(order.date, "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                          className={
                            order.status === "completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            View
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleUpdateOrderStatus(
                                order.id,
                                value as Order["status"],
                              )
                            }
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Order Details Dialog */}
            {selectedOrder && (
              <Dialog
                open={!!selectedOrder}
                onOpenChange={() => setSelectedOrder(null)}
              >
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      Order Details - {selectedOrder.id}
                    </DialogTitle>
                    <DialogDescription>
                      Placed on{" "}
                      {format(selectedOrder.date, "MMMM dd, yyyy HH:mm")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Customer Information</h4>
                      <p>Name: {selectedOrder.customerName}</p>
                      <p>Email: {selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">
                              Subtotal
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                ${item.price.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                ${(item.quantity * item.price).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-medium"
                            >
                              Total
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              ${selectedOrder.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge
                        variant={
                          selectedOrder.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          selectedOrder.status === "completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                        }
                      >
                        Status:{" "}
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Badge>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => {
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            value as Order["status"],
                          );
                          setSelectedOrder({
                            ...selectedOrder,
                            status: value as Order["status"],
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Discount Management Tab */}
          <TabsContent value="discounts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Promotional Discounts</h2>
              <Dialog
                open={discountDialogOpen}
                onOpenChange={setDiscountDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingDiscount(null);
                      setNewDiscount({
                        code: "",
                        amount: 0,
                        type: "percentage",
                        startDate: new Date(),
                        endDate: new Date(),
                        active: true,
                      });
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Discount
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDiscount ? "Edit Discount" : "Add New Discount"}
                    </DialogTitle>
                    <DialogDescription>
                      Create a promotional code for customers to use at
                      checkout.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="code" className="text-right">
                        Promo Code
                      </Label>
                      <Input
                        id="code"
                        value={newDiscount.code}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        className="col-span-3"
                        placeholder="SUMMER10"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newDiscount.amount}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            amount: parseFloat(e.target.value),
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={newDiscount.type}
                        onValueChange={(value) =>
                          setNewDiscount({
                            ...newDiscount,
                            type: value as "percentage" | "fixed",
                          })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="fixed">
                            Fixed Amount ($)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">
                        Start Date
                      </Label>
                      <div className="col-span-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full justify-start text-left font-normal"
                              }
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newDiscount.startDate ? (
                                format(newDiscount.startDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newDiscount.startDate}
                              onSelect={(date) =>
                                date &&
                                setNewDiscount({
                                  ...newDiscount,
                                  startDate: date,
                                })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endDate" className="text-right">
                        End Date
                      </Label>
                      <div className="col-span-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full justify-start text-left font-normal"
                              }
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newDiscount.endDate ? (
                                format(newDiscount.endDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newDiscount.endDate}
                              onSelect={(date) =>
                                date &&
                                setNewDiscount({
                                  ...newDiscount,
                                  endDate: date,
                                })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddDiscount}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium">
                        {discount.code}
                      </TableCell>
                      <TableCell>
                        {discount.type === "percentage"
                          ? `${discount.amount}%`
                          : `$${discount.amount.toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        {format(discount.startDate, "MMM dd, yyyy")} -{" "}
                        {format(discount.endDate, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={discount.active ? "outline" : "secondary"}
                          className={
                            discount.active
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {discount.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleDiscountActive(discount.id)
                            }
                          >
                            {discount.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDiscount(discount)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDiscount(discount.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${salesSummary.today.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${salesSummary.thisWeek.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${salesSummary.thisMonth.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Items</CardTitle>
                  <CardDescription>
                    Most ordered items this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {popularItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">
                            {item.count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Order Times</CardTitle>
                  <CardDescription>Busiest hours of the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time Period</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {peakTimes.map((time, index) => (
                        <TableRow key={index}>
                          <TableCell>{time.time}</TableCell>
                          <TableCell className="text-right">
                            {time.orders}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
