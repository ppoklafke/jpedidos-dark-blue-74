import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, FileText } from "lucide-react";

interface Client {
  id: number;
  name: string;
  document: string;
  type: "PF" | "PJ";
  fantasyName?: string;
  stateRegistration?: string;
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  observations?: string;
  status: "Ativo" | "Inativo";
}

interface ClientViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function ClientView({ open, onOpenChange, client }: ClientViewProps) {
  if (!client) return null;

  const formatAddress = (address: Client["address"]) => {
    if (!address) return "Endereço não informado";
    const complement = address.complement ? `, ${address.complement}` : "";
    return `${address.street}, ${address.number}${complement} - ${address.neighborhood}, ${address.city}/${address.state} - CEP: ${address.zipCode}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com nome e status */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
              {client.type === "PJ" && client.fantasyName && (
                <p className="text-muted-foreground">{client.fantasyName}</p>
              )}
            </div>
            <Badge variant={client.status === "Ativo" ? "default" : "secondary"}>
              {client.status}
            </Badge>
          </div>

          <Separator />

          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de Pessoa
                  </label>
                  <p className="font-medium">
                    {client.type === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {client.type === "PF" ? "CPF" : "CNPJ"}
                  </label>
                  <p className="font-medium">{client.document}</p>
                </div>

                {client.type === "PJ" && client.stateRegistration && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Inscrição Estadual
                    </label>
                    <p className="font-medium">{client.stateRegistration}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Telefone
                    </label>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      E-mail
                    </label>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{formatAddress(client.address)}</p>
            </CardContent>
          </Card>

          {/* Observações */}
          {client.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {client.observations}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}