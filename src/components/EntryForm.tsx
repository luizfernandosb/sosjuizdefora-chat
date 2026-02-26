import { useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BAIRROS = [
  "Centro", "São Mateus", "Cascatinha", "Benfica", "Granbery",
  "Bom Pastor", "Costa Carvalho", "Santa Luzia", "Mariano Procópio",
  "Alto dos Passos", "São Pedro", "Paineiras", "Manoel Honório",
  "Bairu", "Santa Terezinha", "Barbosa Lage", "Industrial",
  "Linhares", "Poço Rico", "Outro"
];

interface EntryFormProps {
  onJoin: (name: string, neighborhood: string) => void;
}

export default function EntryForm({ onJoin }: EntryFormProps) {
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [customNeighborhood, setCustomNeighborhood] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNeighborhood = neighborhood === "Outro" ? customNeighborhood : neighborhood;
    if (name.trim() && finalNeighborhood.trim()) {
      onJoin(name.trim().slice(0, 50), finalNeighborhood.trim().slice(0, 50));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emergency/20 text-accent px-4 py-2 rounded-full mb-6">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Alerta de Emergência</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">
            Chat JF <span className="text-primary">Emergência</span>
          </h1>
          <p className="text-muted-foreground">
            Comunique-se com outros moradores de Juiz de Fora durante a emergência climática.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">
              Seu nome
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como quer ser chamado(a)?"
              maxLength={50}
              required
              className="bg-muted border-border focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">
              Seu bairro
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {BAIRROS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setNeighborhood(b)}
                  className={`text-xs px-2 py-1.5 rounded-lg border transition-all ${
                    neighborhood === b
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {neighborhood === "Outro" && (
              <Input
                value={customNeighborhood}
                onChange={(e) => setCustomNeighborhood(e.target.value)}
                placeholder="Digite o nome do bairro"
                maxLength={50}
                required
                className="bg-muted border-border focus:ring-primary mt-2"
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || (!neighborhood || (neighborhood === "Outro" && !customNeighborhood.trim()))}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-base py-5"
          >
            Entrar no Chat
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          🚨 Use este chat para compartilhar informações úteis sobre a situação na cidade.
        </p>
      </div>
    </div>
  );
}
