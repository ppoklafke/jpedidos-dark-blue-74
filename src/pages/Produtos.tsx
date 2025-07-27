import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductView } from "@/components/ProductView";
import { ProductForm } from "@/components/ProductForm";
import { Plus, Search, Edit, Eye, Package, PackageX, Loader2 } from "lucide-react";
import { useProducts, type ProductFormData } from "@/hooks/useProducts";

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState("");
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  
  // Modal states
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selected product states
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productFormMode, setProductFormMode] = useState<"create" | "edit">("create");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductFormMode("create");
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setProductFormMode("edit");
      setIsProductFormOpen(true);
    }
  };

  const handleViewProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsViewDialogOpen(true);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteProduct = async () => {
    if (selectedProduct) {
      await deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleSubmitProduct = async (data: ProductFormData, id?: number) => {
    if (id) {
      return await updateProduct(id, data);
    } else {
      return await createProduct(data);
    }
  };

  const convertProductToViewFormat = (product: any) => {
    return {
      id: product.id,
      description: product.name || product.description,
      unit: "UN", // Default unit since not stored in DB
      unitPrice: product.price,
      status: ("Ativo" as "Ativo" | "Inativo") // Default to active
    };
  };

  const convertProductToFormFormat = (product: any) => {
    return {
      id: product.id,
      description: product.name || product.description,
      unit: "UN", // Default unit
      unitPrice: product.price,
      status: ("Ativo" as "Ativo" | "Inativo") // Default to active
    };
  };


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seu catálogo de produtos
            </p>
          </div>
          <Button onClick={handleAddProduct} className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por descrição do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Produtos ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>UN</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant="default">Ativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProduct(product.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <PackageX className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {loading ? "Carregando..." : "Nenhum produto encontrado"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Product Form Modal */}
        <ProductForm
          open={isProductFormOpen}
          onOpenChange={setIsProductFormOpen}
          product={selectedProduct ? convertProductToFormFormat(selectedProduct) : undefined}
          mode={productFormMode}
          onSubmit={handleSubmitProduct}
        />

        {/* View Product Dialog */}
        <ProductView
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          product={selectedProduct ? convertProductToViewFormat(selectedProduct) : null}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o produto "{selectedProduct?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}