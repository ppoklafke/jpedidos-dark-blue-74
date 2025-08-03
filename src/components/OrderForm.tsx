import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const orderItemSchema = z.object({
  productId: z.number().min(1, "Produto é obrigatório"),
  productName: z.string(),
  quantity: z.number().min(0.01, "Quantidade deve ser maior que zero"),
  unitPrice: z.number().min(0.01, "Valor deve ser maior que zero"),
  total: z.number(),
});

const orderSchema = z.object({
  clientId: z.number().min(1, "Cliente é obrigatório"),
  date: z.date({ required_error: "Data é obrigatória" }),
  status: z.enum(["Aberto", "Fechado"]),
  withInvoice: z.boolean(),
  items: z.array(orderItemSchema).min(1, "Deve ter pelo menos um item"),
  total: z.number(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Partial<OrderFormData> & { id?: number };
  mode: "create" | "edit";
  onSubmit: (data: OrderFormData, id?: number) => Promise<{ success: boolean }>;
  clients: Array<{ id: number; name: string }>;
  products: Array<{ id: number; description: string; unitPrice: number; status: string }>;
}


export function OrderForm({ open, onOpenChange, order, mode, onSubmit: onSubmitProp, clients, products }: OrderFormProps) {
  const { toast } = useToast();
  const [clientSearchOpen, setClientSearchOpen] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientId: 0,
      date: new Date(),
      status: "Aberto",
      withInvoice: false,
      items: [
        {
          productId: 0,
          productName: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
      total: 0,
    },
  });

  // Reset form when order data changes
  React.useEffect(() => {
    if (order && mode === "edit") {
      form.reset({
        clientId: order.clientId || 0,
        date: order.date || new Date(),
        status: order.status || "Aberto",
        withInvoice: order.withInvoice || false,
        items: order.items || [
          {
            productId: 0,
            productName: "",
            quantity: 1,
            unitPrice: 0,
            total: 0,
          },
        ],
        total: order.total || 0,
      });
    } else if (mode === "create") {
      form.reset({
        clientId: 0,
        date: new Date(),
        status: "Aberto",
        withInvoice: false,
        items: [
          {
            productId: 0,
            productName: "",
            quantity: 1,
            unitPrice: 0,
            total: 0,
          },
        ],
        total: 0,
      });
    }
  }, [order, mode, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateOrderTotal = () => {
    const items = form.getValues("items");
    const total = items.reduce((sum, item) => sum + item.total, 0);
    form.setValue("total", total);
    return total;
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, productId);
      form.setValue(`items.${index}.productName`, product.description);
      form.setValue(`items.${index}.unitPrice`, product.unitPrice);
      
      const quantity = form.getValues(`items.${index}.quantity`);
      const total = calculateItemTotal(quantity, product.unitPrice);
      form.setValue(`items.${index}.total`, total);
      calculateOrderTotal();
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    form.setValue(`items.${index}.quantity`, quantity);
    const unitPrice = form.getValues(`items.${index}.unitPrice`);
    const total = calculateItemTotal(quantity, unitPrice);
    form.setValue(`items.${index}.total`, total);
    calculateOrderTotal();
  };

  const handleUnitPriceChange = (index: number, unitPrice: number) => {
    form.setValue(`items.${index}.unitPrice`, unitPrice);
    const quantity = form.getValues(`items.${index}.quantity`);
    const total = calculateItemTotal(quantity, unitPrice);
    form.setValue(`items.${index}.total`, total);
    calculateOrderTotal();
  };

  const addItem = () => {
    append({
      productId: 0,
      productName: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  };

  const removeItem = (index: number) => {
    remove(index);
    calculateOrderTotal();
  };

  const onSubmit = async (data: OrderFormData) => {
    const result = await onSubmitProp(data, order?.id);

    if (result.success) {
      onOpenChange(false);
      form.reset();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const orderTotal = form.watch("total");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo Pedido" : "Editar Pedido"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={clientSearchOpen}
                                className="w-full justify-between"
                              >
                                 {field.value
                                   ? clients.find((client) => client.id === field.value)?.name
                                   : "Selecione o cliente..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 bg-background border z-50">
                            <Command>
                              <CommandInput placeholder="Digite para buscar cliente..." />
                              <CommandList>
                                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                <CommandGroup>
                                  {clients.map((client) => (
                                    <CommandItem
                                      key={client.id}
                                      value={client.name}
                                      onSelect={() => {
                                        field.onChange(client.id);
                                        setClientSearchOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === client.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {client.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecionar data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Aberto">Aberto</SelectItem>
                            <SelectItem value="Fechado">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="withInvoice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Emitir Nota Fiscal
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Itens do Pedido */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Itens do Pedido</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Produto</FormLabel>
                              <Select 
                                onValueChange={(value) => handleProductChange(index, parseInt(value))}
                                value={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o produto" />
                                  </SelectTrigger>
                                </FormControl>
                                 <SelectContent>
                                   {products
                                     .filter(product => product.status === "Ativo")
                                     .map((product) => (
                                     <SelectItem key={product.id} value={product.id.toString()}>
                                       {product.description}
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(value);
                                  handleQuantityChange(index, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Unit.</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(value);
                                  handleUnitPriceChange(index, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel>Total</FormLabel>
                        <div className="h-10 flex items-center font-medium">
                          {formatCurrency(form.watch(`items.${index}.total`) || 0)}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Total do Pedido */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total do Pedido:</span>
                  <span className="text-2xl text-primary">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {mode === "create" ? "Criar Pedido" : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}