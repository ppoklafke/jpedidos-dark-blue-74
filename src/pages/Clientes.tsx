import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ClientForm } from "@/components/ClientForm";
import { ClientView } from "@/components/ClientView";
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
import { Plus, Search, Edit, Eye, UserCheck, UserX, Loader2 } from "lucide-react";
import { useClients, type ClientFormData } from "@/hooks/useClients";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [clientViewOpen, setClientViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.cpf_cnpj && client.cpf_cnpj.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddClient = () => {
    setSelectedClient(null);
    setFormMode("create");
    setClientFormOpen(true);
  };

  const handleEditClient = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setFormMode("edit");
    setClientFormOpen(true);
  };

  const handleViewClient = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setClientViewOpen(true);
  };

  const handleDeleteClient = async (clientId: number) => {
    await deleteClient(clientId);
  };

  const handleSubmitClient = async (data: ClientFormData, id?: number) => {
    if (id) {
      return await updateClient(id, data);
    } else {
      return await createClient(data);
    }
  };

  const formatDocument = (document: string | null) => {
    if (!document) return '';
    if (document.length === 11) {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (document.length === 14) {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return document;
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const convertClientToViewFormat = (client: any) => {
    return {
      id: client.id,
      name: client.name,
      document: formatDocument(client.cpf_cnpj),
      type: (client.cpf_cnpj?.length === 11 ? "PF" : "PJ") as "PF" | "PJ",
      phone: formatPhone(client.phone),
      email: client.email || '',
      address: {
        street: client.street || '',
        number: client.number || '',
        complement: client.complement || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zip_code || '',
      },
      status: ("Ativo" as "Ativo" | "Inativo")
    };
  };

  const convertClientToFormFormat = (client: any) => {
    const isPhysicalPerson = client.cpf_cnpj?.length === 11;
    return {
      id: client.id,
      name: client.name,
      document: formatDocument(client.cpf_cnpj),
      type: (isPhysicalPerson ? "PF" : "PJ") as "PF" | "PJ",
      phone: formatPhone(client.phone),
      email: client.email || '',
      address: {
        street: client.street || '',
        number: client.number || '',
        complement: client.complement || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zip_code || '',
      },
    };
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes e suas informações
            </p>
          </div>
          <Button onClick={handleAddClient} className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, documento ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Clientes ({filteredClients.length})
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
                    <TableHead>Nome/Razão Social</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{formatDocument(client.cpf_cnpj)}</TableCell>
                      <TableCell>{client.cpf_cnpj?.length === 11 ? "Pessoa Física" : "Pessoa Jurídica"}</TableCell>
                      <TableCell>{formatPhone(client.phone)}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        <Badge variant="default">Ativo</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewClient(client.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClient(client.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <UserX className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {loading ? "Carregando..." : "Nenhum cliente encontrado"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <ClientForm
          open={clientFormOpen}
          onOpenChange={setClientFormOpen}
          client={selectedClient ? convertClientToFormFormat(selectedClient) : undefined}
          mode={formMode}
          onSubmit={handleSubmitClient}
        />

        <ClientView
          open={clientViewOpen}
          onOpenChange={setClientViewOpen}
          client={selectedClient ? convertClientToViewFormat(selectedClient) : null}
        />
      </div>
    </Layout>
  );
}