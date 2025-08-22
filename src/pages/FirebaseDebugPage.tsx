import { useState } from "react";
import { FirebaseDebug } from "../components/FirebaseDebug";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FirebaseDebugPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={() => navigate('/')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>
        
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          🔧 Debug Firebase
        </h1>
        <p className="text-center text-muted-foreground">
          Teste e diagnóstico de problemas com Firebase
        </p>
      </div>

      {/* Problema reportado */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-5 h-5" />
            Problema Reportado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Erro:</strong> "Não foi possível criar a conta, verifique as conexões"
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              Este teste vai ajudar a identificar exatamente onde está o problema.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Debug */}
      <FirebaseDebug />

      {/* Possíveis soluções */}
      <Card className="glass-card mt-8">
        <CardHeader>
          <CardTitle>🛠️ Possíveis Soluções</CardTitle>
          <CardDescription>
            Baseado em problemas comuns do Firebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-muted/20 rounded-lg">
              <h4 className="font-medium mb-2">1. 🌐 Problema de Conexão</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verifique sua conexão com a internet</li>
                <li>• Desative temporariamente antivírus/firewall</li>
                <li>• Teste em outro navegador</li>
              </ul>
            </div>

            <div className="p-4 border border-muted/20 rounded-lg">
              <h4 className="font-medium mb-2">2. 🔒 Regras do Firestore</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vá no Firebase Console → Firestore → Regras</li>
                <li>• Certifique-se que as regras estão em modo teste</li>
                <li>• Deve ter: allow read, write: if true;</li>
              </ul>
            </div>

            <div className="p-4 border border-muted/20 rounded-lg">
              <h4 className="font-medium mb-2">3. ⚙️ Configuração do Firebase</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verifique se o projeto está ativo</li>
                <li>• Confirme se o Firestore Database foi criado</li>
                <li>• Teste a configuração acima</li>
              </ul>
            </div>

            <div className="p-4 border border-muted/20 rounded-lg">
              <h4 className="font-medium mb-2">4. 🔄 Soluções Rápidas</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Recarregue a página (F5)</li>
                <li>• Limpe o cache do navegador</li>
                <li>• Tente em aba anônima/privada</li>
                <li>• Reinicie o servidor</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
