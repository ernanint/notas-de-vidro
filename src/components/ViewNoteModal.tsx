import { useState, useRef, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Save, 
  Edit3, 
  Mic, 
  MicOff, 
  MoreVertical,
  Share,
  Trash,
  Copy,
  Users,
  Volume2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: any;
  onUpdate: (noteId: string, noteData: any) => void;
  onShare: (note: any) => void;
  onDelete?: (noteId: string) => void;
  currentUser: string;
}

export const ViewNoteModal = ({ 
  isOpen, 
  onClose, 
  note, 
  onUpdate, 
  onShare, 
  onDelete, 
  currentUser 
}: ViewNoteModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (note) {
      setEditedTitle(note.title);
      setEditedContent(note.content);
    }
  }, [note]);

  const handleSave = () => {
    if (!note) return;
    
    onUpdate(note.id, {
      title: editedTitle,
      content: editedContent
    });
    setIsEditing(false);
    
    toast({
      title: "💾 Nota salva",
      description: "Suas alterações foram sincronizadas!",
      duration: 2000,
    });
  };

  const handleCancelEdit = () => {
    setEditedTitle(note?.title || "");
    setEditedContent(note?.content || "");
    setIsEditing(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        // Aqui você pode implementar a conversão de áudio para texto
        // Por enquanto, vamos simular
        simulateVoiceToText();
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "🎤 Gravando...",
        description: "Fale agora para ditar o texto",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "❌ Erro no microfone",
        description: "Não foi possível acessar o microfone",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  const simulateVoiceToText = () => {
    // Simulação de conversão de voz para texto
    const simulatedText = `Texto ditado em ${new Date().toLocaleTimeString('pt-BR')}. `;
    setEditedContent(prev => prev + simulatedText);
    
    toast({
      title: "🎤 Dictado adicionado",
      description: "Texto convertido com sucesso!",
      duration: 3000,
    });
  };

  const speakNote = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const text = isEditing ? editedContent : (note?.content || "");
      if (!text.trim()) {
        toast({
          title: "📝 Nota vazia",
          description: "Não há conteúdo para ler",
          duration: 2000,
        });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
      
      toast({
        title: "🔊 Lendo nota...",
        description: "Clique novamente para parar",
        duration: 2000,
      });
    } else {
      toast({
        title: "❌ Não suportado",
        description: "Síntese de voz não disponível",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const copyToClipboard = async () => {
    const text = isEditing ? editedContent : (note?.content || "");
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 Copiado!",
        description: "Conteúdo copiado para a área de transferência",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível copiar",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDelete = () => {
    if (onDelete && note) {
      if (confirm("Tem certeza que deseja excluir esta nota?")) {
        onDelete(note.id);
        onClose();
      }
    }
  };

  if (!note) return null;

  const isOwner = note.owner === currentUser;

  // Preparar estilo do fundo da nota no modal
  const modalStyle: React.CSSProperties = {};
  
  if (note?.backgroundImage) {
    modalStyle.backgroundImage = `url(${note.backgroundImage})`;
    modalStyle.backgroundSize = 'cover';
    modalStyle.backgroundPosition = 'center';
  } else if (note?.backgroundColor) {
    modalStyle.backgroundColor = note.backgroundColor;
  }

  const hasBackground = note?.backgroundImage || note?.backgroundColor;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="glass-modal sm:max-w-2xl w-[95vw] sm:w-full overflow-hidden flex flex-col relative p-6"
        style={modalStyle}
      >
        {/* Overlay para melhorar legibilidade quando há fundo */}
        {hasBackground && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg" />
        )}
        
        <div className="relative z-10 flex flex-col h-full">
          <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`text-lg font-semibold ${
                    hasBackground 
                      ? "glass-input bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70" 
                      : "glass-input"
                  }`}
                  placeholder="Título da nota"
                />
              ) : (
                <DialogTitle className={`text-xl ${
                  hasBackground 
                    ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                    : ""
                }`}>
                  {note.title}
                </DialogTitle>
              )}
              <DialogDescription className={`mt-2 ${
                hasBackground
                  ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  : ""
              }`}>
                Por: <strong>{note.owner}</strong> • 
                {note.sharedWith.length > 0 && (
                  <span className={`ml-1 ${
                    hasBackground ? "text-yellow-300" : "text-primary"
                  }`}>
                    {note.sharedWith.length} colaborador(es)
                  </span>
                )}
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Botão de Falar */}
              <Button
                variant={hasBackground ? "secondary" : "outline"}
                size="sm"
                onClick={speakNote}
                title={isSpeaking ? "Parar leitura" : "Ler nota"}
                className={hasBackground 
                  ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" 
                  : ""
                }
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-red-300' : ''}`} />
              </Button>

              {/* Menu de opções */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={hasBackground ? "secondary" : "outline"}
                    size="sm"
                    className={hasBackground 
                      ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" 
                      : ""
                    }
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card">
                  <DropdownMenuItem onClick={() => onShare(note)}>
                    <Users className="w-4 h-4 mr-2" />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar texto
                  </DropdownMenuItem>
                  {isOwner && onDelete && (
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Excluir nota
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label 
                    htmlFor="content"
                    className={hasBackground 
                      ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                      : ""
                    }
                  >
                    Conteúdo
                  </Label>
                  <Textarea
                    id="content"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className={hasBackground 
                      ? "glass-input bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 min-h-[300px] resize-none"
                      : "glass-input min-h-[300px] resize-none"
                    }
                    placeholder="Escreva o conteúdo da sua nota aqui..."
                  />
                </div>
              </div>
            ) : (
              <div 
                className={`prose prose-sm max-w-none dark:prose-invert p-4 rounded-lg cursor-text min-h-[300px] whitespace-pre-wrap ${
                  hasBackground
                    ? "bg-black/20 backdrop-blur-sm border border-white/20 text-white"
                    : "bg-muted/5"
                }`}
                onClick={() => isOwner && setIsEditing(true)}
                title={isOwner ? "Clique para editar" : "Somente leitura"}
              >
                {note.content || (
                  <span className={`italic ${
                    hasBackground 
                      ? "text-white/70" 
                      : "text-muted-foreground"
                  }`}>
                    {isOwner ? "Clique aqui para adicionar conteúdo..." : "Nota vazia"}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className={`shrink-0 pt-4 ${
            hasBackground 
              ? "border-t border-white/20" 
              : "border-t border-muted/20"
          }`}>
            {isEditing ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={hasBackground ? "secondary" : "outline"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`${isRecording ? "text-red-300" : ""} ${
                      hasBackground 
                        ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" 
                        : ""
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isRecording ? "Parar" : "Ditar"}
                  </Button>
                  
                  {isRecording && (
                    <div className={`flex items-center gap-2 ${
                      hasBackground ? "text-red-300" : "text-red-600"
                    }`}>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs">Gravando...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant={hasBackground ? "secondary" : "outline"}
                    onClick={handleCancelEdit}
                    className={hasBackground 
                      ? "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30" 
                      : ""
                    }
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className={hasBackground 
                      ? "bg-white/30 backdrop-blur-sm border-white/30 text-white hover:bg-white/40" 
                      : "glass-button"
                    }
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className={`text-xs space-y-1 ${
                  hasBackground 
                    ? "text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                    : "text-muted-foreground"
                }`}>
                  <div>Criada: {note.createdAt.toLocaleString('pt-BR')}</div>
                  <div>Atualizada: {note.updatedAt.toLocaleString('pt-BR')}</div>
                </div>
                
                {isOwner && (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    className={hasBackground 
                      ? "bg-white/30 backdrop-blur-sm border-white/30 text-white hover:bg-white/40" 
                      : "glass-button"
                    }
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
