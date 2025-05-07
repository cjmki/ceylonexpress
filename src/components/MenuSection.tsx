import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

interface MenuSectionProps {
  items?: MenuItem[];
  onAddToOrder?: (item: MenuItem, quantity: number) => void;
}

const MenuSection = ({
  items = defaultMenuItems,
  onAddToOrder = () => {},
}: MenuSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories = [
    "all",
    ...Array.from(new Set(items.map((item) => item.category))),
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (id: string, change: number) => {
    setQuantities((prev) => {
      const currentQuantity = prev[id] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [id]: newQuantity };
    });
  };

  const handleAddToOrder = (item: MenuItem) => {
    const quantity = quantities[item.id] || 0;
    if (quantity > 0) {
      onAddToOrder(item, quantity);
      // Reset quantity after adding to order
      setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Our Menu</h2>
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={activeCategory}
          onValueChange={setActiveCategory}
        >
          <TabsList className="mb-6 flex flex-wrap">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{item.name}</CardTitle>
                        <div className="text-lg font-bold">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      {item.popular && <Badge className="w-fit">Popular</Badge>}
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-gray-600">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={!quantities[item.id]}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-8 text-center">
                          {quantities[item.id] || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleAddToOrder(item)}
                        disabled={!quantities[item.id]}
                      >
                        Add to Order
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No menu items found. Try a different search term or category.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Default menu items for demonstration
const defaultMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    description:
      "Juicy beef patty with lettuce, tomato, cheese, and our special sauce",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    category: "mains",
    popular: true,
  },
  {
    id: "2",
    name: "Loaded Fries",
    description:
      "Crispy fries topped with cheese, bacon bits, and green onions",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
    category: "sides",
  },
  {
    id: "3",
    name: "Chicken Wings",
    description: "Spicy buffalo wings served with blue cheese dip",
    price: 10.99,
    image:
      "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80",
    category: "appetizers",
    popular: true,
  },
  {
    id: "4",
    name: "Caesar Salad",
    description:
      "Fresh romaine lettuce with parmesan, croutons, and caesar dressing",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80",
    category: "salads",
  },
  {
    id: "5",
    name: "Chocolate Brownie",
    description: "Warm chocolate brownie served with vanilla ice cream",
    price: 6.99,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80",
    category: "desserts",
  },
  {
    id: "6",
    name: "Veggie Wrap",
    description:
      "Grilled vegetables, hummus, and feta cheese in a spinach wrap",
    price: 11.99,
    image:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
    category: "mains",
  },
];

export default MenuSection;
