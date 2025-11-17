import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Paperclip, Search, Globe, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [tokensUsed, setTokensUsed] = useState(500);
  const [isLoading, setIsLoading] = useState(false);

  const maxTokens = 1000000;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simular respuesta de IA (aquí se integrará Lovable AI)
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: "Respuesta de análisis de IA en desarrollo...",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTokensUsed((prev) => prev + 150);
      setIsLoading(false);
    }, 1000);
  };

  const handleOSINT = () => {
    toast({
      title: "Búsqueda OSINT",
      description: "Iniciando búsqueda de inteligencia de fuentes abiertas...",
    });
  };

  const handleSearch = () => {
    toast({
      title: "Buscar Información",
      description: "Buscando información relevante...",
    });
  };

  const handleFileAttach = () => {
    toast({
      title: "Adjuntar Documento",
      description: "Función de adjuntar documentos próximamente...",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Análisis con IA</h1>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <CardTitle>Análisis de Seguridad</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleOSINT}
                variant="secondary"
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                OSINT
              </Button>
              <Button
                onClick={handleSearch}
                variant="secondary"
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar Información
              </Button>
            </div>

            {/* Chat Area */}
            <Card className="bg-muted/30">
              <ScrollArea className="h-[400px] p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Inicia una conversación con el Detective IA...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-secondary text-secondary-foreground">
                          <div className="flex gap-1">
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce delay-100">.</span>
                            <span className="animate-bounce delay-200">.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFileAttach}
                  title="Adjuntar documento"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Escribe tus instrucciones aquí..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </Button>
              </div>

              {/* Token Counter */}
              <div className="text-sm text-muted-foreground text-center">
                Tokens usados: {tokensUsed.toLocaleString()} de{" "}
                {maxTokens.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAnalysis;
