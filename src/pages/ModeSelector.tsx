import { useState } from "react";
import { Database, HardDrive, Users, Zap, Shield, Smartphone, Settings, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

export const ModeSelector = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'local' | 'firebase' | null>(null);

  const handleModeSelect = (mode: 'local' | 'firebase') => {
    setSelectedMode(mode);
    setTimeout(() => {
      if (mode === 'local') {
        navigate('/local');
      } else {
        navigate('/firebase');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GlassNotes
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Escolha como você quer usar o app
          </p>
          <p className="text-sm text-muted-foreground">
            Você pode alternar entre os modos a qualquer momento
          </p>
        </div>

        {/* Firebase Debug Alert */}
        <Card className="glass-card mb-8 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Problemas com Firebase?
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Se está tendo erro ao criar conta no Firebase, use nossa ferramenta de diagnóstico.
                  </p>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-900/30"
                    onClick={() => navigate('/debug-firebase')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    🔧 Debug Firebase
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Local Mode */}
          <Card 
            className={`glass-card cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedMode === 'local' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleModeSelect('local')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <HardDrive className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Modo Local</CardTitle>
              <CardDescription>
                Dados salvos no seu computador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Funciona offline</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Mais rápido</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Dados ficam no seu PC</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-muted/20">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Limitações:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Compartilhamento limitado</li>
                  <li>• Só funciona neste navegador</li>
                  <li>• Pode perder dados ao limpar cache</li>
                </ul>
              </div>

              <Button 
                className="w-full glass-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModeSelect('local');
                }}
              >
                Usar Modo Local
              </Button>
            </CardContent>
          </Card>

          {/* Firebase Mode */}
          <Card 
            className={`glass-card cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedMode === 'firebase' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleModeSelect('firebase')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">🔥 Firebase</CardTitle>
              <CardDescription>
                Dados salvos na nuvem (Google)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Compartilhamento real</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Sincronização em tempo real</span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Acesso de qualquer dispositivo</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-muted/20">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Requisitos:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Precisa de internet</li>
                  <li>• Dados ficam no Google Firebase</li>
                  <li>• Compartilhamento entre usuários</li>
                </ul>
              </div>

              <Button 
                className="w-full glass-button bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModeSelect('firebase');
                }}
              >
                🔥 Usar Firebase
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-center">Comparação Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted/20">
                    <th className="text-left p-3">Recurso</th>
                    <th className="text-center p-3">Local</th>
                    <th className="text-center p-3">Firebase</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-muted/10">
                    <td className="p-3">Funciona offline</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">❌</td>
                  </tr>
                  <tr className="border-b border-muted/10">
                    <td className="p-3">Compartilhamento entre dispositivos</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr className="border-b border-muted/10">
                    <td className="p-3">Sincronização em tempo real</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr className="border-b border-muted/10">
                    <td className="p-3">Dados seguros na nuvem</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                  <tr>
                    <td className="p-3">Velocidade</td>
                    <td className="text-center p-3">⚡ Rápido</td>
                    <td className="text-center p-3">🌐 Depende da internet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            💡 Dica: Comece com o modo Local para testar, depois migre para Firebase para compartilhamento real
          </p>
        </div>
      </div>
    </div>
  );
};