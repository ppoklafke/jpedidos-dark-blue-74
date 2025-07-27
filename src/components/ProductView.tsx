import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, DollarSign, Tag } from "lucide-react";

interface Product {
  id: number;
  description: string;
  unit: string;
  unitPrice: number;
  status: "Ativo" | "Inativo";
}

interface ProductViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductView({ open, onOpenChange, product }: ProductViewProps) {
  if (!product) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalhes do Produto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com nome e status */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{product.description}</h2>
              <p className="text-muted-foreground">ID: #{product.id}</p>
            </div>
            <Badge variant={product.status === "Ativo" ? "default" : "secondary"}>
              {product.status}
            </Badge>
          </div>

          <Separator />

          {/* Informações do produto */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Unidade
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold">{product.unit}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor Unitário
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(product.unitPrice)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Informações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={product.status === "Ativo" ? "default" : "secondary"}>
                  {product.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disponível para pedidos:</span>
                <span className="font-medium">
                  {product.status === "Ativo" ? "Sim" : "Não"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}