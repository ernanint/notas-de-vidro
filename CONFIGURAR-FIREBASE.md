# 🔥 Configuração do Firebase - Passo a Passo

## 1️⃣ Criar Projeto no Firebase

1. **Acesse:** https://console.firebase.google.com
2. **Clique em:** "Criar um projeto" ou "Adicionar projeto"
3. **Nome do projeto:** `notas-de-vidro` (ou qualquer nome que preferir)
4. **Desabilite o Google Analytics** (não é necessário para este projeto)
5. **Clique em:** "Criar projeto"

## 2️⃣ Configurar Firestore Database

1. **No menu lateral, clique em:** "Firestore Database"
2. **Clique em:** "Criar banco de dados"
3. **Modo:** Selecione "Começar no modo de teste" (permite leitura/escrita por 30 dias)
4. **Localização:** Escolha "us-central" (ou mais próximo do Brasil: southamerica-east1)
5. **Clique em:** "Concluído"

## 3️⃣ Registrar o App Web

1. **Na página inicial do projeto, clique no ícone:** `</>`  (ícone da web)
2. **Nome do app:** `notas-de-vidro-web`
3. **NÃO marque** "Configurar Firebase Hosting"
4. **Clique em:** "Registrar app"

## 4️⃣ Copiar Configuração

1. **Na tela de configuração, copie APENAS o objeto firebaseConfig:**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 5️⃣ Colar no Projeto

1. **Abra o arquivo:** `src/config/firebase.ts`
2. **Substitua as informações de exemplo pela sua configuração**
3. **Salve o arquivo**

## 6️⃣ Instalar Firebase

Execute um destes comandos:

### Opção 1: npm
```bash
npm install firebase
```

### Opção 2: Se npm não funcionar
```bash
.\nodejs\npm.cmd install firebase
```

### Opção 3: Usando yarn (se tiver)
```bash
yarn add firebase
```

## 7️⃣ Configurar Regras de Segurança (IMPORTANTE!)

1. **No Firebase Console, vá em:** "Firestore Database"
2. **Clique na aba:** "Regras"
3. **Substitua as regras por:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para notas compartilhadas
    match /shared_notes/{document} {
      allow read, write: if true; // Para testes - MUDE DEPOIS!
    }
    
    // Regras para tarefas compartilhadas  
    match /shared_tasks/{document} {
      allow read, write: if true; // Para testes - MUDE DEPOIS!
    }
  }
}
```

4. **Clique em:** "Publicar"

## 8️⃣ Testar

1. **Execute:** `iniciar-servidor.bat`
2. **Acesse:** http://localhost:8080
3. **Crie uma nota compartilhada**
4. **Verifique no Firebase Console** se a nota apareceu

---

## ⚠️ IMPORTANTE - Segurança

As regras acima são para **TESTE APENAS**. Para produção, use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shared_notes/{document} {
      allow read, write: if resource.data.owner == request.auth.uid || 
                          resource.data.sharedWith.hasAny([request.auth.uid]);
    }
  }
}
```

## 🆘 Se Tiver Problemas

1. **Erro de instalação:** Tente executar como administrador
2. **Erro de configuração:** Verifique se copiou tudo certinho
3. **Erro de conexão:** Verifique sua internet
4. **Erro de permissão:** Verifique as regras do Firestore

---

**Depois de configurar, me avise que vou finalizar a integração! 🚀**
