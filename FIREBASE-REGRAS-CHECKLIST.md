# 🔧 REGRAS DO FIREBASE PARA CHECKLIST

## ⚠️ **AÇÃO NECESSÁRIA: ATUALIZAR REGRAS DO FIRESTORE**

Para que a nova funcionalidade de **Lista de Tarefas** funcione, você precisa adicionar regras no Firebase Console.

---

## 🔥 **REGRAS ATUALIZADAS DO FIRESTORE:**

Copie e cole no Firebase Console > Firestore Database > Regras:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permite acesso total a todas as collections (para desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Regra específica para usuarios
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Regra específica para shared_notes
    match /shared_notes/{noteId} {
      allow read, write: if true;
    }
    
    // Regra específica para shared_tasks
    match /shared_tasks/{taskId} {
      allow read, write: if true;
    }
    
    // 🆕 NOVA: Regra específica para checklist_items
    match /checklist_items/{itemId} {
      allow read, write: if true;
    }
    
    // Regra para conexão de teste
    match /test_connection/{docId} {
      allow read, write: if true;
    }
  }
}
```

---

## 📋 **PASSO A PASSO:**

### **1. Acesse o Firebase Console:**
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: **"notas-de-vidro"**

### **2. Navegue para Firestore:**
- No menu lateral, clique em **"Firestore Database"**

### **3. Abra as Regras:**
- Clique na aba **"Regras"** (Rules)

### **4. Substitua as Regras:**
- **Apague** todo o conteúdo atual
- **Cole** as regras acima
- Clique em **"Publicar"** (Publish)

### **5. Teste a Funcionalidade:**
- Acesse o app
- Vá na aba **"Lista"**
- Crie um item de checklist
- Verifique se salva corretamente

---

## 📊 **COLLECTIONS DO FIREBASE:**

Agora seu projeto terá **4 collections principais:**

1. **`users`** → Dados dos usuários
2. **`shared_notes`** → Notas compartilháveis
3. **`shared_tasks`** → Tarefas complexas
4. **`checklist_items`** → Lista simples (NOVA!)
5. **`test_connection`** → Teste de conexão

---

## 🧪 **VALIDAÇÃO:**

Após atualizar as regras, teste:

### **✅ Checklist deve funcionar:**
- ✅ Criar item na lista
- ✅ Marcar/desmarcar como concluído
- ✅ Personalizar com cor/imagem
- ✅ Compartilhar com outros usuários
- ✅ Persistir após recarregar página

### **❌ Se não funcionar:**
1. **Verifique se as regras foram publicadas**
2. **Confirme o nome da collection:** `checklist_items`
3. **Veja o console do navegador** (F12) para erros
4. **Teste outras funcionalidades** para garantir que não quebrou nada

---

## 🔍 **LOGS IMPORTANTES:**

No console do navegador, procure por:
- ✅ `✅ useFirebaseChecklist - Item salvo com sucesso!`
- ❌ `❌ permission-denied` → Regras não atualizadas
- ❌ `❌ collection-not-found` → Nome da collection errado

---

## 🎯 **RESULTADO ESPERADO:**

Após atualizar as regras:
- **📋 Nova aba "Lista"** totalmente funcional
- **✅ Items persistem** no Firebase
- **👥 Compartilhamento** funciona entre usuários  
- **🎨 Customização visual** salva corretamente
- **📊 Progresso atualiza** em tempo real

---

## 🚨 **IMPORTANTE:**

**⚠️ Essas regras são permissivas (allow all) para desenvolvimento.**

**🔒 Para produção, você deve implementar regras mais específicas baseadas em autenticação de usuário.**

---

**🔥 Atualize as regras agora e teste a nova funcionalidade de Lista!**
