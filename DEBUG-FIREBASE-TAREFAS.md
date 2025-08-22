# 🔍 DEBUG: PROBLEMAS COM TAREFAS E IMAGENS

## 🎯 **INVESTIGAÇÃO EM ANDAMENTO**

Adicionei logs detalhados para identificar os problemas:

### **1. 📋 Problema com Tarefas:**
- Suspeita: Collection `shared_tasks` pode não existir nas regras do Firebase
- Logs adicionados em: TasksFirebase, CreateTaskModal, useFirebaseSharedTasks

### **2. 🎨 Problema com Imagens:**
- Suspeita: função `cleanFirestoreData` pode estar removendo as imagens
- Logs adicionados na função de limpeza dos dados

---

## 🚨 **INSTRUÇÕES DE DEBUG:**

### **1. Abra o Console do Navegador:**
- **Chrome/Edge:** F12 → Aba "Console"
- **Firefox:** F12 → Aba "Console"

### **2. Teste Criar Tarefa:**
1. **Vá para aba "Tarefas"**
2. **Clique no botão "+"** 
3. **Observe no console:**
   - `🔥 TasksFirebase - Componente carregado`
   - `🔥 TasksFirebase - Botão + clicado, abrindo modal`
   - `🔥 CreateTaskModal - isOpen: true`

4. **Preencha e salve a tarefa**
5. **Observe no console:**
   - `🔥 CreateTaskModal - handleSubmit chamado`
   - `🔥 useFirebaseSharedTasks - createSharedTask CHAMADO!`

### **3. Teste Criar Nota com Imagem:**
1. **Vá para aba "Minhas Notas"**
2. **Clique no botão "+"**
3. **Adicione uma imagem de fundo**
4. **Salve a nota**
5. **Observe no console:**
   - `📝 CreateNoteModal - backgroundImage: TEM IMAGEM`
   - `🧹 cleanFirestoreData - ENTRADA:`
   - `✅ cleanFirestoreData - Mantendo backgroundImage:`

---

## 🔧 **POSSÍVEL CORREÇÃO NECESSÁRIA:**

### **Regras do Firebase para Tarefas:**

Se não houver logs de tarefa sendo criada, você precisa adicionar esta regra no Firebase Console:

1. **Vá para Firebase Console**
2. **Firestore Database → Regras**
3. **Adicione esta regra:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite acesso aos usuários
    match /users/{document=**} {
      allow read, write: if true;
    }
    
    // Permite acesso às notas compartilhadas
    match /shared_notes/{document=**} {
      allow read, write: if true;
    }
    
    // ADICIONE ESTA LINHA PARA TAREFAS:
    match /shared_tasks/{document=**} {
      allow read, write: if true;
    }
    
    // Permite teste de conexão
    match /test_connection/{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 📋 **CHECKLIST DE DEBUG:**

### **Para Tarefas:**
- [ ] Console mostra "TasksFirebase - Componente carregado"?
- [ ] Console mostra "Botão + clicado"?  
- [ ] Modal de tarefa abre?
- [ ] Console mostra "handleSubmit chamado"?
- [ ] Console mostra "createSharedTask CHAMADO"?
- [ ] Há erros vermelhos no console?

### **Para Imagens:**
- [ ] Console mostra "backgroundImage: TEM IMAGEM"?
- [ ] Console mostra logs do cleanFirestoreData?
- [ ] A imagem aparece no preview do modal?
- [ ] Console mostra "Mantendo backgroundImage"?
- [ ] Há erros vermelhos no console?

---

## 🚀 **FAÇA O TESTE AGORA:**

### **🔴 BOTÕES DE DEBUG TEMPORÁRIOS ADICIONADOS:**

**1. Na aba "Tarefas":**
- Botão vermelho: **"🚨 DEBUG: Teste Direto de Tarefa"**
- Clica direto no código, sem modal

**2. Na aba "Minhas Notas":**
- Botão vermelho: **"🚨 DEBUG: Teste Direto Nota c/ Imagem"**
- Cria nota com imagem direto no código

---

### **🧪 SEQUÊNCIA DE TESTES:**

**1. Abra o console do navegador (F12 → Console)**

**2. Teste o botão DEBUG de Tarefa:**
- Vá para aba "Tarefas"
- Clique no botão vermelho "DEBUG: Teste Direto de Tarefa"
- **Anote TODOS os logs que aparecem no console**

**3. Teste o botão DEBUG de Nota:**
- Vá para aba "Minhas Notas"  
- Clique no botão vermelho "DEBUG: Teste Direto Nota c/ Imagem"
- **Anote TODOS os logs que aparecem no console**

**4. Teste os botões normais:**
- Tente criar tarefa pelo botão "+" normal
- Tente criar nota com imagem pelo botão "+" normal
- **Anote a diferença nos logs**

---

### **📋 O QUE VERIFICAR NO CONSOLE:**

**Se aparecer:**
- ✅ Logs começando com 🔥, 🚨, 🧹 → **Código está rodando**
- ❌ Erros vermelhos com "Firebase" → **Problema nas regras**
- ❌ Erros vermelhos com "permission-denied" → **Falta regra shared_tasks**
- ❌ Nenhum log → **Botão não está sendo clicado**

---

**📧 ME MANDE:**
1. **Todos os logs do console** (pode fazer print ou copiar o texto)
2. **Diga se os botões DEBUG funcionaram**
3. **Diga se apareceu alguma tarefa ou nota nova**

**Vou usar essas informações para identificar exatamente onde está o problema!** 🔍
