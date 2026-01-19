import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, BookOpen, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SAMPLE_NOTES = [
  {
    title: "Introducere în POO (C++) - Concepte Fundamentale",
    description: "Rezumat complet despre programarea orientată pe obiecte în C++: clase, obiecte, moștenire și polimorfism.",
    subject: "Programare",
    faculty: "CSIE",
    year: 1,
    content: `# Programare Orientată pe Obiecte în C++

## Introducere

Programarea Orientată pe Obiecte (POO) reprezintă o paradigmă de programare bazată pe conceptul de **obiecte**, care conțin date sub formă de câmpuri (atribute) și cod sub formă de proceduri (metode).

---

## 1. Clase și Obiecte

### Ce este o clasă?

O **clasă** este un șablon (blueprint) pentru crearea obiectelor. Definește atributele și comportamentul pe care le vor avea obiectele.

\`\`\`cpp
class Student {
private:
    string nume;
    int varsta;
    double medie;

public:
    // Constructor
    Student(string n, int v, double m) {
        nume = n;
        varsta = v;
        medie = m;
    }

    // Metodă getter
    string getNume() {
        return nume;
    }

    // Metodă pentru afișare
    void afiseaza() {
        cout << "Student: " << nume << ", " << varsta << " ani, medie: " << medie << endl;
    }
};
\`\`\`

### Crearea unui obiect

\`\`\`cpp
int main() {
    Student s1("Ion Popescu", 20, 9.5);
    s1.afiseaza();  // Output: Student: Ion Popescu, 20 ani, medie: 9.5
    return 0;
}
\`\`\`

---

## 2. Încapsularea

**Încapsularea** este mecanismul prin care datele (atributele) și metodele sunt legate împreună, protejând datele de accesul neautorizat.

- \`private\` - accesibil doar în interiorul clasei
- \`protected\` - accesibil în clasă și în clasele derivate
- \`public\` - accesibil de oriunde

---

## 3. Moștenirea

**Moștenirea** permite unei clase să preia atributele și metodele altei clase.

\`\`\`cpp
class Persoana {
protected:
    string nume;
    int varsta;

public:
    Persoana(string n, int v) : nume(n), varsta(v) {}
    
    virtual void afiseaza() {
        cout << "Persoana: " << nume << endl;
    }
};

class Student : public Persoana {
private:
    string facultate;

public:
    Student(string n, int v, string f) : Persoana(n, v), facultate(f) {}
    
    void afiseaza() override {
        cout << "Student: " << nume << " la " << facultate << endl;
    }
};
\`\`\`

---

## 4. Polimorfismul

**Polimorfismul** permite obiectelor de tipuri diferite să fie tratate ca obiecte ale unui tip de bază comun.

### Polimorfism la compilare (supraîncărcarea)

\`\`\`cpp
class Calculator {
public:
    int aduna(int a, int b) { return a + b; }
    double aduna(double a, double b) { return a + b; }
    int aduna(int a, int b, int c) { return a + b + c; }
};
\`\`\`

### Polimorfism la execuție (funcții virtuale)

\`\`\`cpp
Persoana* p = new Student("Maria", 21, "CSIE");
p->afiseaza();  // Apelează Student::afiseaza() datorită funcției virtuale
\`\`\`

---

## Concluzii

Cele patru principii fundamentale ale POO sunt:
1. **Abstracția** - ascunderea complexității
2. **Încapsularea** - protejarea datelor
3. **Moștenirea** - reutilizarea codului
4. **Polimorfismul** - flexibilitatea codului

> 💡 **Sfat**: Practica este esențială! Încercați să implementați exemple proprii pentru fiecare concept.
`
  },
  {
    title: "Analiză Matematică - Limite și Derivate",
    description: "Sumar teoretic și practic pentru calculul limitelor și derivatelor, cu exemple rezolvate pas cu pas.",
    subject: "Matematică",
    faculty: "CSIE",
    year: 1,
    content: `# Analiză Matematică: Limite și Derivate

## Partea I: Limite de Funcții

### Definiția limitei

Spunem că **limita funcției f(x) când x tinde la a este L** și scriem:

$$\\lim_{x \\to a} f(x) = L$$

dacă pentru orice ε > 0 există δ > 0 astfel încât |f(x) - L| < ε pentru orice x cu 0 < |x - a| < δ.

---

### Limite fundamentale

1. **Limite algebrice de bază:**
   - \`lim (x→a) c = c\` (constanta)
   - \`lim (x→a) x = a\`
   - \`lim (x→a) [f(x) ± g(x)] = lim f(x) ± lim g(x)\`

2. **Limite trigonometrice:**
   - \`lim (x→0) sin(x)/x = 1\`
   - \`lim (x→0) (1-cos(x))/x = 0\`
   - \`lim (x→0) tan(x)/x = 1\`

3. **Limite exponențiale:**
   - \`lim (x→0) (eˣ - 1)/x = 1\`
   - \`lim (x→0) ln(1+x)/x = 1\`
   - \`lim (x→∞) (1 + 1/x)ˣ = e\`

---

### Exemple rezolvate

**Exemplu 1:** Calculați \`lim (x→2) (x² - 4)/(x - 2)\`

**Rezolvare:**
\`\`\`
lim (x→2) (x² - 4)/(x - 2)
= lim (x→2) (x-2)(x+2)/(x-2)
= lim (x→2) (x + 2)
= 2 + 2 = 4
\`\`\`

**Exemplu 2:** Calculați \`lim (x→0) sin(3x)/x\`

**Rezolvare:**
\`\`\`
lim (x→0) sin(3x)/x
= lim (x→0) 3 · sin(3x)/(3x)
= 3 · 1 = 3
\`\`\`

---

## Partea II: Derivate

### Definiția derivatei

**Derivata** funcției f în punctul x₀ este:

$$f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}$$

---

### Formule de derivare

| Funcția f(x) | Derivata f'(x) |
|-------------|----------------|
| c (constantă) | 0 |
| xⁿ | n·xⁿ⁻¹ |
| eˣ | eˣ |
| ln(x) | 1/x |
| sin(x) | cos(x) |
| cos(x) | -sin(x) |
| tan(x) | 1/cos²(x) |

---

### Reguli de derivare

1. **Regula sumei:** \`(f + g)' = f' + g'\`
2. **Regula produsului:** \`(f · g)' = f' · g + f · g'\`
3. **Regula câtului:** \`(f/g)' = (f' · g - f · g')/g²\`
4. **Regula lanțului:** \`(f ∘ g)'(x) = f'(g(x)) · g'(x)\`

---

### Exemple rezolvate

**Exemplu 1:** Derivați \`f(x) = 3x⁴ - 2x² + 5x - 7\`

**Rezolvare:**
\`\`\`
f'(x) = 3 · 4x³ - 2 · 2x + 5 - 0
f'(x) = 12x³ - 4x + 5
\`\`\`

**Exemplu 2:** Derivați \`f(x) = sin(x²)\` (folosind regula lanțului)

**Rezolvare:**
\`\`\`
f'(x) = cos(x²) · (x²)'
f'(x) = cos(x²) · 2x
f'(x) = 2x · cos(x²)
\`\`\`

**Exemplu 3:** Derivați \`f(x) = x · eˣ\` (folosind regula produsului)

**Rezolvare:**
\`\`\`
f'(x) = (x)' · eˣ + x · (eˣ)'
f'(x) = 1 · eˣ + x · eˣ
f'(x) = eˣ(1 + x)
\`\`\`

---

## Aplicații ale derivatelor

1. **Tangenta la grafic** în punctul (x₀, f(x₀)): y - f(x₀) = f'(x₀)(x - x₀)
2. **Puncte de extrem**: se găsesc unde f'(x) = 0
3. **Studiul monotoniei**: f'(x) > 0 ⟹ f crescătoare

---

> 📝 **Important:** Exersați cât mai multe probleme! Derivarea devine intuitivă cu practică.
`
  },
  {
    title: "Structuri de Date - Liste și Arbori",
    description: "Ghid complet pentru structuri de date fundamentale: liste înlănțuite, stive, cozi și arbori binari.",
    subject: "Programare",
    faculty: "CSIE",
    year: 2,
    content: `# Structuri de Date: Liste și Arbori

## Introducere

Structurile de date sunt modalități de organizare și stocare a datelor pentru a permite operații eficiente. Alegerea corectă a structurii de date poate face diferența între un algoritm rapid și unul lent.

---

## 1. Liste Înlănțuite

### Lista Simplu Înlănțuită

Fiecare nod conține o valoare și un pointer către nodul următor.

\`\`\`cpp
struct Nod {
    int data;
    Nod* next;
    
    Nod(int val) : data(val), next(nullptr) {}
};

class ListaInlantuita {
private:
    Nod* head;
    
public:
    ListaInlantuita() : head(nullptr) {}
    
    // Inserare la început - O(1)
    void insereazaLaInceput(int val) {
        Nod* nou = new Nod(val);
        nou->next = head;
        head = nou;
    }
    
    // Inserare la sfârșit - O(n)
    void insereazaLaSfarsit(int val) {
        Nod* nou = new Nod(val);
        if (!head) {
            head = nou;
            return;
        }
        Nod* temp = head;
        while (temp->next) {
            temp = temp->next;
        }
        temp->next = nou;
    }
    
    // Căutare - O(n)
    bool cauta(int val) {
        Nod* temp = head;
        while (temp) {
            if (temp->data == val) return true;
            temp = temp->next;
        }
        return false;
    }
};
\`\`\`

### Avantaje și Dezavantaje

| ✅ Avantaje | ❌ Dezavantaje |
|------------|----------------|
| Inserare/ștergere O(1) la început | Acces O(n) la elemente |
| Dimensiune dinamică | Memorie suplimentară pentru pointeri |
| Fără realocare | Nu permite acces aleator |

---

## 2. Stive (Stack)

**LIFO** - Last In, First Out

\`\`\`cpp
class Stiva {
private:
    vector<int> elemente;
    
public:
    void push(int val) {
        elemente.push_back(val);
    }
    
    int pop() {
        if (elemente.empty()) throw runtime_error("Stiva goală!");
        int val = elemente.back();
        elemente.pop_back();
        return val;
    }
    
    int top() {
        if (elemente.empty()) throw runtime_error("Stiva goală!");
        return elemente.back();
    }
    
    bool isEmpty() {
        return elemente.empty();
    }
};
\`\`\`

**Aplicații:** evaluare expresii, undo/redo, apeluri funcții (call stack)

---

## 3. Cozi (Queue)

**FIFO** - First In, First Out

\`\`\`cpp
class Coada {
private:
    queue<int> q;
    
public:
    void enqueue(int val) {
        q.push(val);
    }
    
    int dequeue() {
        if (q.empty()) throw runtime_error("Coada goală!");
        int val = q.front();
        q.pop();
        return val;
    }
    
    int front() {
        return q.front();
    }
};
\`\`\`

**Aplicații:** BFS, buffere, sisteme de ticketing

---

## 4. Arbori Binari

### Structura unui nod

\`\`\`cpp
struct NodArbore {
    int data;
    NodArbore* left;
    NodArbore* right;
    
    NodArbore(int val) : data(val), left(nullptr), right(nullptr) {}
};
\`\`\`

### Arbore Binar de Căutare (BST)

Proprietate: left < root < right

\`\`\`cpp
class BST {
private:
    NodArbore* root;
    
    NodArbore* insert(NodArbore* node, int val) {
        if (!node) return new NodArbore(val);
        
        if (val < node->data)
            node->left = insert(node->left, val);
        else if (val > node->data)
            node->right = insert(node->right, val);
            
        return node;
    }
    
public:
    BST() : root(nullptr) {}
    
    void insert(int val) {
        root = insert(root, val);
    }
};
\`\`\`

### Parcurgeri

1. **Preordine (RSD):** Rădăcină → Stânga → Dreapta
2. **Inordine (SRD):** Stânga → Rădăcină → Dreapta (sortare pentru BST!)
3. **Postordine (SDR):** Stânga → Dreapta → Rădăcină

---

## Complexități

| Structură | Acces | Căutare | Inserare | Ștergere |
|-----------|-------|---------|----------|----------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Lista înlănțuită | O(n) | O(n) | O(1) | O(1) |
| BST (mediu) | O(log n) | O(log n) | O(log n) | O(log n) |
| BST (worst) | O(n) | O(n) | O(n) | O(n) |

---

> 💡 **Sfat:** Alegeți structura de date în funcție de operațiile predominante din aplicația voastră!
`
  },
  {
    title: "Microeconomie - Cerere, Ofertă și Echilibru",
    description: "Concepte fundamentale de microeconomie: legea cererii și ofertei, elasticitate și echilibrul pieței.",
    subject: "Microeconomie",
    faculty: "CSIE",
    year: 1,
    content: `# Microeconomie: Cerere, Ofertă și Echilibru

## Introducere

Microeconomia studiază comportamentul individual al agenților economici (consumatori, firme) și modul în care aceștia interacționează pe piețe pentru a determina prețurile și cantitățile bunurilor.

---

## 1. Cererea

### Legea Cererii

> **Legea cererii:** Când prețul unui bun crește, cantitatea cerută scade (ceteris paribus).

Relația inversă între preț și cantitate cerută se datorează:
- **Efectului de substituție** - consumatorii trec la alternative mai ieftine
- **Efectului de venit** - puterea de cumpărare scade

### Funcția cererii

**Forma generală:** Qd = f(P, Venit, Prețuri alte bunuri, Preferințe, ...)

**Forma liniară:** Qd = a - bP

unde:
- Qd = cantitatea cerută
- P = prețul
- a = interceptul (cererea maximă la preț 0)
- b = panta (sensibilitatea la preț)

### Exemplu

Dacă Qd = 100 - 2P:
- La P = 10: Qd = 100 - 2(10) = 80 unități
- La P = 20: Qd = 100 - 2(20) = 60 unități

---

## 2. Oferta

### Legea Ofertei

> **Legea ofertei:** Când prețul unui bun crește, cantitatea oferită crește (ceteris paribus).

Producătorii sunt motivați să producă mai mult când pot obține prețuri mai mari.

### Funcția ofertei

**Forma liniară:** Qs = c + dP

unde:
- Qs = cantitatea oferită
- c = interceptul
- d = panta

### Exemplu

Dacă Qs = -20 + 3P:
- La P = 10: Qs = -20 + 3(10) = 10 unități
- La P = 20: Qs = -20 + 3(20) = 40 unități

---

## 3. Echilibrul Pieței

### Determinarea echilibrului

Echilibrul apare când **Qd = Qs**

**Exemplu:**
- Cerere: Qd = 100 - 2P
- Ofertă: Qs = -20 + 3P

La echilibru:
\`\`\`
100 - 2P = -20 + 3P
120 = 5P
P* = 24 (prețul de echilibru)
Q* = 100 - 2(24) = 52 (cantitatea de echilibru)
\`\`\`

### Ce se întâmplă în afara echilibrului?

| Situație | Preț | Rezultat |
|----------|------|----------|
| **Surplus** | P > P* | Qd < Qs → presiune de scădere a prețului |
| **Deficit** | P < P* | Qd > Qs → presiune de creștere a prețului |

---

## 4. Elasticitatea

### Elasticitatea cererii în funcție de preț

$$E_d = \\frac{\\%\\Delta Q_d}{\\%\\Delta P} = \\frac{\\Delta Q_d / Q_d}{\\Delta P / P}$$

**Interpretare:**
- |Ed| > 1: Cerere **elastică** (consumatorii sunt sensibili la preț)
- |Ed| < 1: Cerere **inelastică** (consumatorii nu sunt sensibili)
- |Ed| = 1: Elasticitate **unitară**

### Factori care influențează elasticitatea

1. **Disponibilitatea substitutelor** - mai multe substitute → cerere mai elastică
2. **Ponderea în buget** - bunuri scumpe → cerere mai elastică
3. **Timp** - pe termen lung, cererea este mai elastică
4. **Necesitate vs. lux** - bunurile de lux au cerere mai elastică

---

## 5. Deplasări ale curbelor

### Deplasarea curbei cererii (dreapta = creștere)

Factori:
- ↑ Venit (pentru bunuri normale)
- ↑ Prețul substitutelor
- ↓ Prețul complementelor
- Schimbări în preferințe
- ↑ Numărul consumatorilor

### Deplasarea curbei ofertei (dreapta = creștere)

Factori:
- ↓ Costurile de producție
- Îmbunătățiri tehnologice
- ↑ Numărul producătorilor
- Așteptări favorabile

---

## Rezumat

| Concept | Formula cheie |
|---------|---------------|
| Echilibru | Qd = Qs |
| Elasticitate | Ed = (%ΔQd) / (%ΔP) |
| Surplus | Qs > Qd la P > P* |
| Deficit | Qd > Qs la P < P* |

> 📊 **Recomandare:** Exercitați graficele! Vizualizarea deplasărilor curbelor ajută enorm la înțelegere.
`
  },
  {
    title: "Algoritmi - Sortare și Căutare",
    description: "Algoritmi fundamentali de sortare (QuickSort, MergeSort) și căutare (binară), cu analiză de complexitate.",
    subject: "Programare",
    faculty: "CSIE",
    year: 1,
    content: `# Algoritmi de Sortare și Căutare

## Introducere

Sortarea și căutarea sunt operații fundamentale în programare. Înțelegerea algoritmilor și a complexității lor este esențială pentru scrierea de cod eficient.

---

## 1. Algoritmi de Sortare

### Bubble Sort - O(n²)

Cel mai simplu algoritm, dar și cel mai lent.

\`\`\`cpp
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}
\`\`\`

---

### Quick Sort - O(n log n) mediu

Algoritm "divide et impera" foarte eficient în practică.

\`\`\`cpp
int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
\`\`\`

**Complexitate:**
- Best/Average: O(n log n)
- Worst: O(n²) - când pivotul este mereu minim/maxim

---

### Merge Sort - O(n log n)

Garantează O(n log n) în toate cazurile.

\`\`\`cpp
void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> L(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> R(arr.begin() + mid + 1, arr.begin() + right + 1);
    
    int i = 0, j = 0, k = left;
    
    while (i < L.size() && j < R.size()) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    while (i < L.size()) arr[k++] = L[i++];
    while (j < R.size()) arr[k++] = R[j++];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}
\`\`\`

---

### Comparație algoritmi de sortare

| Algoritm | Best | Average | Worst | Spațiu | Stabil? |
|----------|------|---------|-------|--------|---------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Da |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | Nu |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Da |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | Nu |

---

## 2. Algoritmi de Căutare

### Căutare Liniară - O(n)

Parcurge toate elementele până găsește valoarea.

\`\`\`cpp
int cautareLineare(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;  // găsit la poziția i
        }
    }
    return -1;  // negăsit
}
\`\`\`

---

### Căutare Binară - O(log n)

Funcționează **doar pe array-uri sortate**!

\`\`\`cpp
int cautareBinara(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;  // găsit
        } else if (arr[mid] < target) {
            left = mid + 1;  // caută în dreapta
        } else {
            right = mid - 1;  // caută în stânga
        }
    }
    return -1;  // negăsit
}
\`\`\`

### Versiune recursivă

\`\`\`cpp
int cautareBinaraRec(vector<int>& arr, int target, int left, int right) {
    if (left > right) return -1;
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) 
        return cautareBinaraRec(arr, target, mid + 1, right);
    return cautareBinaraRec(arr, target, left, mid - 1);
}
\`\`\`

---

## 3. Analiza Complexității

### Ce înseamnă O(log n)?

La fiecare pas, căutarea binară elimină jumătate din elemente:
- n → n/2 → n/4 → n/8 → ... → 1
- Număr de pași: log₂(n)

**Exemplu practic:**
- Pentru n = 1.000.000 de elemente
- Căutare liniară: până la 1.000.000 de comparații
- Căutare binară: maxim log₂(1.000.000) ≈ 20 de comparații!

---

## Sfaturi pentru examene

1. **QuickSort** - cel mai folosit în practică (sort din STL)
2. **MergeSort** - când ai nevoie de stabilitate sau sortare externă
3. **Căutare binară** - folosește-o oriunde ai date sortate!

> ⚡ **Reține:** Sortarea + căutare binară = O(n log n + log n) = O(n log n)
> Mai bun decât n căutări liniare = O(n²)
`
  }
];

export const ContentSeeding = () => {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSeedContent = async () => {
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Insert all sample notes
      const notesToInsert = SAMPLE_NOTES.map(note => ({
        ...note,
        user_id: user.id,
        downloads: Math.floor(Math.random() * 50) + 10, // Random downloads 10-60
      }));

      const { error } = await supabase
        .from('notes')
        .insert(notesToInsert);

      if (error) throw error;

      setSeeded(true);
      toast({
        title: "Succes! 🎉",
        description: `${SAMPLE_NOTES.length} notițe de calitate au fost adăugate.`,
      });
    } catch (error: any) {
      console.error('Error seeding content:', error);
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut adăuga notițele.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Populare Conținut Demo
        </CardTitle>
        <CardDescription>
          Adaugă notițe de calitate pentru cursurile populare (Programare, Matematică, Microeconomie)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Ce se va adăuga:</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Introducere în POO (C++) - Clase, Moștenire, Polimorfism</li>
                <li>• Analiză Matematică - Limite și Derivate</li>
                <li>• Structuri de Date - Liste și Arbori</li>
                <li>• Microeconomie - Cerere, Ofertă și Echilibru</li>
                <li>• Algoritmi - Sortare și Căutare</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={handleSeedContent} 
            disabled={loading || seeded}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se adaugă conținutul...
              </>
            ) : seeded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Conținut adăugat cu succes!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Adaugă {SAMPLE_NOTES.length} Notițe Demo
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};