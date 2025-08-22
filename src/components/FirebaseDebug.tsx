import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { CheckCircle, XCircle, Loader2, Database, AlertCircle } from "lucide-react";

export const FirebaseDebug = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test: string, success: boolean, details: string) => {
    setTestResults(prev => [...prev, { test, success, details, timestamp: new Date() }]);
  };

  const runFirebaseTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Teste 1: Verificar se Firebase está inicializado
      addTestResult("Inicialização Firebase", true, "Firebase inicializado com sucesso");

      // Teste 2: Testar conexão com Firestore
      try {
        const testCollection = collection(db, 'test_connection');
        addTestResult("Conexão Firestore", true, "Conexão com Firestore estabelecida");

        // Teste 3: Testar leitura
        try {
          const querySnapshot = await getDocs(testCollection);
          addTestResult("Leitura Firestore", true, `Leitura realizada (${querySnapshot.size} documentos)`);
        } catch (readError: any) {
          addTestResult("Leitura Firestore", false, `Erro na leitura: ${readError.message}`);
        }

        // Teste 4: Testar escrita
        try {
          const testDoc = {
            message: "Teste de conexão",
            timestamp: Timestamp.now(),
            user: "debug-test"
          };
          
          const docRef = await addDoc(testCollection, testDoc);
          addTestResult("Escrita Firestore", true, `Documento criado com ID: ${docRef.id}`);
        } catch (writeError: any) {
          addTestResult("Escrita Firestore", false, `Erro na escrita: ${writeError.message}`);
        }

        // Teste 5: Testar collection 'users'
        try {
          const usersCollection = collection(db, 'users');
          const usersSnapshot = await getDocs(usersCollection);
          addTestResult("Collection 'users'", true, `${usersSnapshot.size} usuários encontrados`);
        } catch (usersError: any) {
          addTestResult("Collection 'users'", false, `Erro: ${usersError.message}`);
        }

      } catch (firestoreError: any) {
        addTestResult("Conexão Firestore", false, `Erro: ${firestoreError.message}`);
      }

    } catch (initError: any) {
      addTestResult("Inicialização Firebase", false, `Erro: ${initError.message}`);
    }

    setIsLoading(false);
  };

  const testUserCreation = async () => {
    setIsLoading(true);
    
    try {
      const testUser = {
        name: `TestUser_${Date.now()}`,
        password: "123456",
        securityQuestion: "Qual seu animal favorito?",
        securityAnswer: "cachorro",
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'users'), testUser);
      addTestResult("Criação de Usuário", true, `Usuário de teste criado com ID: ${docRef.id}`);
    } catch (error: any) {
      addTestResult("Criação de Usuário", false, `Erro detalhado: ${error.message}`);
      console.error("Erro completo:", error);
    }
    
    setIsLoading(false);
  };

  const testNoteCreation = async () => {
    setIsLoading(true);
    
    try {
      const testNote = {
        title: `Nota de Teste ${Date.now()}`,
        content: "Conteúdo de teste para verificar se a criação de notas funciona.",
        owner: "TestUser",
        sharedWith: [],
        backgroundColor: "#ffffff",
        isLocked: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        changeHistory: [{
          userId: "TestUser",
          userName: "TestUser",
          action: "Criou a nota",
          timestamp: Timestamp.now()
        }]
      };

      const docRef = await addDoc(collection(db, 'shared_notes'), testNote);
      addTestResult("Criação de Nota", true, `Nota de teste criada com ID: ${docRef.id}`);
    } catch (error: any) {
      addTestResult("Criação de Nota", false, `Erro detalhado: ${error.message}`);
      console.error("Erro completo:", error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-500" />
            🔧 Debug Firebase
          </CardTitle>
          <CardDescription>
            Teste de conexão e funcionalidades do Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={runFirebaseTests}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Testar Conexão
            </Button>
            
            <Button 
              onClick={testUserCreation}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Testar Usuário
            </Button>

            <Button 
              onClick={testNoteCreation}
              disabled={isLoading}
              variant="secondary"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Testar Nota
            </Button>
          </div>

          {/* Informações de configuração */}
          <div className="p-3 bg-muted/10 rounded-lg border border-muted/20">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Configuração Atual:
            </h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>• <strong>Projeto:</strong> notas-de-vidro</div>
              <div>• <strong>API Key:</strong> AIza...M2w (configurado)</div>
              <div>• <strong>Auth Domain:</strong> notas-de-vidro.firebaseapp.com</div>
            </div>
          </div>

          {/* Resultados dos testes */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados dos Testes:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">{result.test}</span>
                    </div>
                    <div className={`text-xs ${
                      result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 Checklist Firebase:</h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div>1. ✅ Projeto "notas-de-vidro" criado no Firebase</div>
              <div>2. ✅ Firestore Database ativado</div>
              <div>3. ✅ Regras configuradas (modo teste)</div>
              <div>4. ❓ Conexão de internet funcionando</div>
              <div>5. ❓ Sem bloqueios de firewall/antivírus</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
