import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, BookOpen, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SAMPLE_NOTES = [
  // ============ ALGEBRA ============
  {
    title: "Algebră Liniară - Curs 1: Matrice și Determinanți",
    description: "Introducere în matrice, tipuri de matrice, operații cu matrice și calculul determinanților.",
    subject: "Algebra",
    faculty: "CSIE",
    year: 1,
    content: `# Algebră Liniară: Matrice și Determinanți

## Introducere în Matrice

O **matrice** este un tabel dreptunghiular de numere, aranjate pe linii și coloane.

### Notație

O matrice A de dimensiune m×n se notează:

\`\`\`
A = | a₁₁  a₁₂  ...  a₁ₙ |
    | a₂₁  a₂₂  ...  a₂ₙ |
    | ...  ...  ...  ... |
    | aₘ₁  aₘ₂  ...  aₘₙ |
\`\`\`

---

## Tipuri Speciale de Matrice

### 1. Matrice Pătratică
O matrice cu același număr de linii și coloane (m = n).

### 2. Matrice Diagonală
Elementele în afara diagonalei principale sunt 0.

\`\`\`
D = | 3  0  0 |
    | 0  5  0 |
    | 0  0  2 |
\`\`\`

### 3. Matrice Unitate (Identitate)
Matricea diagonală cu 1 pe diagonala principală.

\`\`\`
I₃ = | 1  0  0 |
     | 0  1  0 |
     | 0  0  1 |
\`\`\`

### 4. Matrice Triunghiulară
- **Superior**: elemente sub diagonală = 0
- **Inferior**: elemente deasupra diagonalei = 0

### 5. Matrice Simetrică
A = Aᵀ (transpusa matricei este egală cu matricea)

---

## Operații cu Matrice

### Adunarea și Scăderea
Se face element cu element (matricele trebuie să aibă aceeași dimensiune).

\`\`\`
| 1  2 |   | 5  6 |   | 6   8  |
| 3  4 | + | 7  8 | = | 10  12 |
\`\`\`

### Înmulțirea cu Scalar
Fiecare element se înmulțește cu scalarul.

\`\`\`
    | 1  2 |   | 3   6  |
3 · | 3  4 | = | 9   12 |
\`\`\`

### Înmulțirea Matricelor
A(m×n) · B(n×p) = C(m×p)

\`\`\`cpp
// Algoritmul de înmulțire în C++
for (int i = 0; i < m; i++) {
    for (int j = 0; j < p; j++) {
        C[i][j] = 0;
        for (int k = 0; k < n; k++) {
            C[i][j] += A[i][k] * B[k][j];
        }
    }
}
\`\`\`

---

## Determinanți

### Determinant de Ordin 2

\`\`\`
det(A) = | a  b | = a·d - b·c
         | c  d |
\`\`\`

**Exemplu:**
\`\`\`
det | 3  2 | = 3·5 - 2·4 = 15 - 8 = 7
    | 4  5 |
\`\`\`

### Determinant de Ordin 3 (Regula lui Sarrus)

\`\`\`
det(A) = a₁₁a₂₂a₃₃ + a₁₂a₂₃a₃₁ + a₁₃a₂₁a₃₂
       - a₁₃a₂₂a₃₁ - a₁₁a₂₃a₃₂ - a₁₂a₂₁a₃₃
\`\`\`

---

## Proprietăți ale Determinanților

1. **det(Aᵀ) = det(A)**
2. **det(A·B) = det(A) · det(B)**
3. Dacă o linie este 0, det(A) = 0
4. Interschimbarea a două linii schimbă semnul determinantului
5. Înmulțirea unei linii cu k: det(A') = k · det(A)

---

> 📝 **Pentru examen:** Memorați regula lui Sarrus și proprietățile determinanților!
`
  },
  {
    title: "Algebră Liniară - Seminar 1: Exerciții Rezolvate",
    description: "Exerciții practice cu matrice și determinanți, rezolvate pas cu pas.",
    subject: "Algebra",
    faculty: "CSIE",
    year: 1,
    content: `# Seminar Algebră: Exerciții cu Matrice și Determinanți

## Exercițiul 1: Operații cu Matrice

### Enunț
Fie matricele:
\`\`\`
A = | 2  -1 |    B = | 0   3 |
    | 4   3 |        | -2  1 |
\`\`\`

Calculați: a) A + B  b) 2A - B  c) A · B

### Rezolvare

**a) A + B**
\`\`\`
A + B = | 2+0    -1+3 |   | 2   2 |
        | 4+(-2)  3+1 | = | 2   4 |
\`\`\`

**b) 2A - B**
\`\`\`
2A = | 4  -2 |
     | 8   6 |

2A - B = | 4-0    -2-3 |   | 4   -5 |
         | 8-(-2)  6-1 | = | 10   5 |
\`\`\`

**c) A · B**
\`\`\`
(A·B)₁₁ = 2·0 + (-1)·(-2) = 0 + 2 = 2
(A·B)₁₂ = 2·3 + (-1)·1 = 6 - 1 = 5
(A·B)₂₁ = 4·0 + 3·(-2) = 0 - 6 = -6
(A·B)₂₂ = 4·3 + 3·1 = 12 + 3 = 15

A · B = | 2    5  |
        | -6   15 |
\`\`\`

---

## Exercițiul 2: Determinant de Ordin 2

### Enunț
Calculați determinanții:
\`\`\`
D₁ = | 5   2 |    D₂ = | -3   4 |
     | 3   7 |         |  6  -8 |
\`\`\`

### Rezolvare

**D₁:**
\`\`\`
D₁ = 5·7 - 2·3 = 35 - 6 = 29
\`\`\`

**D₂:**
\`\`\`
D₂ = (-3)·(-8) - 4·6 = 24 - 24 = 0
\`\`\`

> ⚠️ **Observație:** D₂ = 0 înseamnă că matricea nu este inversabilă!

---

## Exercițiul 3: Determinant de Ordin 3

### Enunț
\`\`\`
D = | 1   2   3 |
    | 4   5   6 |
    | 7   8   9 |
\`\`\`

### Rezolvare (Regula lui Sarrus)

**Diagonale principale (cu +):**
- 1 · 5 · 9 = 45
- 2 · 6 · 7 = 84
- 3 · 4 · 8 = 96

**Diagonale secundare (cu -):**
- 3 · 5 · 7 = 105
- 1 · 6 · 8 = 48
- 2 · 4 · 9 = 72

**Rezultat:**
\`\`\`
D = (45 + 84 + 96) - (105 + 48 + 72)
D = 225 - 225 = 0
\`\`\`

---

## Exercițiul 4: Inversabilitate

### Enunț
Verificați dacă matricea A este inversabilă și, dacă da, calculați A⁻¹.
\`\`\`
A = | 2   1 |
    | 5   3 |
\`\`\`

### Rezolvare

**Pasul 1:** Calculăm determinantul
\`\`\`
det(A) = 2·3 - 1·5 = 6 - 5 = 1 ≠ 0 ✓
\`\`\`

Matricea este inversabilă!

**Pasul 2:** Calculăm inversa
\`\`\`
A⁻¹ = (1/det(A)) · |  d  -b |
                   | -c   a |

A⁻¹ = (1/1) · |  3  -1 |   |  3  -1 |
              | -5   2 | = | -5   2 |
\`\`\`

**Verificare:** A · A⁻¹ = I
\`\`\`
| 2  1 | · |  3  -1 | = | 6-5    -2+2 | = | 1  0 | ✓
| 5  3 |   | -5   2 |   | 15-15  -5+6 |   | 0  1 |
\`\`\`

---

> 💡 **Tips pentru examen:**
> - Verificați întotdeauna rezultatul!
> - Pentru determinanți 3×3, scrieți schema diagonalelor
> - Dacă det = 0, matricea NU este inversabilă
`
  },
  {
    title: "Algebră Liniară - Rezumat pentru Examen",
    description: "Sinteză completă a materiei de algebră liniară: toate formulele și conceptele esențiale.",
    subject: "Algebra",
    faculty: "CSIE",
    year: 1,
    content: `# Rezumat Algebră Liniară - Pregătire Examen

## I. Matrice - Formule Esențiale

### Tipuri de Matrice
| Tip | Caracteristici |
|-----|----------------|
| Pătratică | m = n |
| Diagonală | aᵢⱼ = 0 pentru i ≠ j |
| Unitate Iₙ | Diagonală cu 1 pe diagonală |
| Simetrică | A = Aᵀ |
| Antisimetrică | A = -Aᵀ |
| Nilpotentă | Aⁿ = 0 pentru un n |

### Proprietăți Operații
- (A + B)ᵀ = Aᵀ + Bᵀ
- (A · B)ᵀ = Bᵀ · Aᵀ
- (Aᵀ)ᵀ = A
- A · I = I · A = A
- A · 0 = 0 · A = 0

---

## II. Determinanți

### Formule Rapide

**Ordin 2:**
\`\`\`
| a  b |
| c  d | = ad - bc
\`\`\`

**Ordin 3 (Sarrus):**
\`\`\`
= a₁₁a₂₂a₃₃ + a₁₂a₂₃a₃₁ + a₁₃a₂₁a₃₂
- a₁₃a₂₂a₃₁ - a₁₁a₂₃a₃₂ - a₁₂a₂₁a₃₃
\`\`\`

### Proprietăți Critice
1. det(Aᵀ) = det(A)
2. det(A·B) = det(A)·det(B)
3. det(A⁻¹) = 1/det(A)
4. det(kA) = kⁿ·det(A) pentru matrice n×n
5. Linie/coloană de zerouri → det = 0
6. Două linii identice → det = 0

---

## III. Sisteme Liniare

### Regula lui Cramer
Pentru sistemul AX = B:
\`\`\`
xᵢ = det(Aᵢ) / det(A)
\`\`\`
unde Aᵢ = A cu coloana i înlocuită de B.

### Rang și Soluții
- **Rang(A) = Rang(A|B) = n** → sistem determinat (soluție unică)
- **Rang(A) = Rang(A|B) < n** → sistem nedeterminat (∞ soluții)
- **Rang(A) ≠ Rang(A|B)** → sistem incompatibil (fără soluții)

---

## IV. Spații Vectoriale

### Definiție
Un spațiu vectorial V peste ℝ satisface:
1. (V, +) este grup abelian
2. Înmulțirea cu scalar este asociativă și distributivă
3. 1 · v = v pentru orice v ∈ V

### Concepte Cheie
- **Bază:** mulțime liniar independentă care generează V
- **Dimensiune:** numărul de vectori din bază
- **Subspațiu:** submulțime care este ea însăși spațiu vectorial

---

## V. Transformări Liniare

### Proprietăți
O funcție T: V → W este liniară dacă:
- T(u + v) = T(u) + T(v)
- T(αv) = αT(v)

### Nuclee și Imagine
- **Ker(T)** = {v ∈ V : T(v) = 0} (nucleul)
- **Im(T)** = {T(v) : v ∈ V} (imaginea)
- **dim(Ker(T)) + dim(Im(T)) = dim(V)**

---

## VI. Valori și Vectori Proprii

### Definiție
λ este valoare proprie a lui A dacă:
\`\`\`
det(A - λI) = 0  (ecuația caracteristică)
\`\`\`

### Pași de Calcul
1. Scriem A - λI
2. Calculăm det(A - λI) = 0
3. Rezolvăm polinomul caracteristic → valorile proprii λ
4. Pentru fiecare λ, rezolvăm (A - λI)x = 0 → vectorii proprii

---

## VII. Formulare Rapidă - Inversă 2×2

\`\`\`
     | a  b |⁻¹        1      |  d  -b |
A =  | c  d |    → A⁻¹ = ―――― | -c   a |
                       ad-bc
\`\`\`

---

> 🎯 **Sfaturi pentru examen:**
> 1. Începeți cu exercițiile simple
> 2. Verificați calculele!
> 3. Dacă det = 0, menționați că matricea nu e inversabilă
> 4. La sisteme, verificați rangul întâi
`
  },

  // ============ MICROECONOMIE ============
  {
    title: "Microeconomie - Curs 1: Cerere, Ofertă și Echilibrul Pieței",
    description: "Concepte fundamentale de microeconomie: legea cererii și ofertei, elasticitate și mecanismul pieței.",
    subject: "Microeconomie",
    faculty: "CSIE",
    year: 1,
    content: `# Microeconomie: Cerere, Ofertă și Echilibru

## Introducere

**Microeconomia** studiază comportamentul agenților economici individuali (consumatori, firme) și modul în care aceștia interacționează pe piețe.

---

## I. Cererea

### Legea Cererii
> Când prețul crește, cantitatea cerută scade (și invers), **ceteris paribus**.

### Funcția Cererii
\`\`\`
Qd = f(P, Venit, Preferințe, Prețuri bunuri substitut/complementare, Așteptări)
\`\`\`

**Forma liniară simplificată:**
\`\`\`
Qd = a - b·P

unde:
- a = cererea maximă (când P = 0)
- b = sensibilitatea cererii la preț
- P = prețul
\`\`\`

### Exemplu
Dacă Qd = 100 - 2P:
- La P = 10: Qd = 100 - 2·10 = 80 unități
- La P = 20: Qd = 100 - 2·20 = 60 unități

---

## II. Oferta

### Legea Ofertei
> Când prețul crește, cantitatea oferită crește (și invers), **ceteris paribus**.

### Funcția Ofertei
\`\`\`
Qs = g(P, Costuri producție, Tehnologie, Prețuri inputuri, Așteptări)
\`\`\`

**Forma liniară simplificată:**
\`\`\`
Qs = c + d·P

unde:
- c = oferta minimă
- d = sensibilitatea ofertei la preț
\`\`\`

---

## III. Echilibrul Pieței

### Condiția de Echilibru
\`\`\`
Qd = Qs → Preț de echilibru (P*)
\`\`\`

### Exemplu Complet
**Date:**
- Cerere: Qd = 120 - 3P
- Ofertă: Qs = 20 + 2P

**Rezolvare:**
\`\`\`
Qd = Qs
120 - 3P = 20 + 2P
100 = 5P
P* = 20 lei

Q* = 120 - 3·20 = 60 unități
(verificare: Qs = 20 + 2·20 = 60 ✓)
\`\`\`

---

## IV. Elasticitatea Cererii

### Elasticitatea Preț
\`\`\`
       ΔQ/Q     ΔQ   P
Ep = ―――――― = ――― · ―
       ΔP/P     ΔP   Q
\`\`\`

### Interpretare
| Valoare |Ep|| Tip Cerere | Exemplu |
|---------|-------------|---------|
| > 1 | Elastică | Bunuri de lux |
| = 1 | Unitară | - |
| < 1 | Inelastică | Bunuri necesare |
| = 0 | Perfect inelastică | Medicamente vitale |

### Elasticitatea Venit
\`\`\`
       ΔQ/Q     ΔQ    V
Ev = ―――――― = ――― · ―
       ΔV/V     ΔV    Q
\`\`\`

- Ev > 0: Bunuri normale
- Ev < 0: Bunuri inferioare
- Ev > 1: Bunuri de lux

---

## V. Surplus-ul Consumatorului și Producătorului

### Surplusul Consumatorului
Diferența dintre suma pe care consumatorul era dispus să o plătească și suma plătită efectiv.

\`\`\`
SC = (1/2) · (Pmax - P*) · Q*
\`\`\`

### Surplusul Producătorului
Diferența dintre prețul primit și prețul minim acceptat.

\`\`\`
SP = (1/2) · (P* - Pmin) · Q*
\`\`\`

---

## VI. Deplasări vs. Mișcări

### Pe curba cererii (mișcare)
- Cauză: **modificarea prețului bunului**
- Efect: schimbarea cantității cerute

### A curbei cererii (deplasare)
- Cauze: venit, preferințe, prețuri alte bunuri
- Efect: nouă curbă de cerere

---

> 💡 **Important:** Întotdeauna specificați dacă e mișcare PE curbă sau deplasare A curbei!
`
  },
  {
    title: "Microeconomie - Seminar: Probleme Rezolvate",
    description: "Exerciții practice de microeconomie: calcul echilibru, elasticități și surplus.",
    subject: "Microeconomie",
    faculty: "CSIE",
    year: 1,
    content: `# Seminar Microeconomie: Exerciții Rezolvate

## Problema 1: Echilibrul Pieței

### Enunț
Pe piața unui bun, cererea și oferta sunt date de:
- Qd = 200 - 4P
- Qs = -40 + 2P

**Cerințe:**
a) Determinați prețul și cantitatea de echilibru
b) Reprezentați grafic
c) Ce se întâmplă dacă prețul e fixat la 30 lei?

### Rezolvare

**a) Echilibru:**
\`\`\`
Qd = Qs
200 - 4P = -40 + 2P
240 = 6P
P* = 40 lei

Q* = 200 - 4·40 = 40 unități
\`\`\`

**b) Puncte pentru grafic:**
- Cerere: P=0 → Q=200; Q=0 → P=50
- Ofertă: P=20 → Q=0; P=50 → Q=60

**c) La P = 30 lei:**
\`\`\`
Qd = 200 - 4·30 = 80 (cerere)
Qs = -40 + 2·30 = 20 (ofertă)

Exces de cerere (deficit) = 80 - 20 = 60 unități
\`\`\`

---

## Problema 2: Elasticitatea Cererii

### Enunț
Funcția cererii: Qd = 100 - 2P

Calculați elasticitatea prețului în punctul P = 20.

### Rezolvare

\`\`\`
La P = 20: Q = 100 - 2·20 = 60

Ep = (dQ/dP) · (P/Q)
dQ/dP = -2

Ep = -2 · (20/60) = -2 · (1/3) = -2/3 ≈ -0.67
\`\`\`

**Interpretare:** |Ep| = 0.67 < 1 → cerere inelastică

O creștere a prețului cu 10% duce la o scădere a cantității cu doar 6.7%.

---

## Problema 3: Surplus Consumator și Producător

### Enunț
Pe o piață: Qd = 80 - P, Qs = -20 + P

Calculați surplusul consumatorului și producătorului la echilibru.

### Rezolvare

**Pasul 1: Echilibru**
\`\`\`
80 - P = -20 + P
100 = 2P
P* = 50, Q* = 30
\`\`\`

**Pasul 2: Prețuri limită**
- Pmax (cerere): Q = 0 → P = 80
- Pmin (ofertă): Q = 0 → P = 20

**Pasul 3: Surplusuri**
\`\`\`
SC = (1/2) · (80 - 50) · 30 = (1/2) · 30 · 30 = 450

SP = (1/2) · (50 - 20) · 30 = (1/2) · 30 · 30 = 450
\`\`\`

**Surplus total = 900**

---

## Problema 4: Impact Taxe

### Enunț
Statul introduce o taxă de 6 lei/unitate pe producători.
Cerere: Qd = 100 - 2P
Ofertă: Qs = 10 + P

Cum se modifică echilibrul?

### Rezolvare

**Echilibru inițial:**
\`\`\`
100 - 2P = 10 + P
90 = 3P → P₀ = 30, Q₀ = 40
\`\`\`

**După taxă (oferta se deplasează):**
\`\`\`
Noua ofertă: Qs' = 10 + (P - 6) = 4 + P

Nou echilibru:
100 - 2P = 4 + P
96 = 3P → P₁ = 32, Q₁ = 36
\`\`\`

**Analiza incidentei:**
\`\`\`
Consumatorul plătește: 32 - 30 = 2 lei din taxă
Producătorul suportă: 6 - 2 = 4 lei din taxă

Pierderea bunăstării (deadweight loss) = (1/2) · 6 · 4 = 12
\`\`\`

---

## Problema 5: Bunuri Complementare

### Enunț
Elasticitatea încrucișată între cafea și zahăr este -0.3. Prețul zaharului crește cu 20%. Cum se modifică cererea de cafea?

### Rezolvare

\`\`\`
Exy = (ΔQx/Qx) / (ΔPy/Py)

-0.3 = (ΔQx/Qx) / 0.20

ΔQx/Qx = -0.3 · 0.20 = -0.06 = -6%
\`\`\`

**Cererea de cafea scade cu 6%.**

> Interpretare: Exy < 0 confirmă că sunt bunuri complementare (se consumă împreună).

---

> 🎯 **Pentru examen:** Urmăriți pașii metodic și verificați unitățile de măsură!
`
  },
  {
    title: "Microeconomie - Rezumat Examen: Formule și Concepte",
    description: "Sinteză completă pentru examenul de microeconomie: toate formulele esențiale pe o singură pagină.",
    subject: "Microeconomie",
    faculty: "CSIE",
    year: 1,
    content: `# Cheat Sheet Microeconomie

## 1. Cerere și Ofertă

| Concept | Formula |
|---------|---------|
| Cerere liniară | Qd = a - bP |
| Ofertă liniară | Qs = c + dP |
| Echilibru | Qd = Qs |
| Exces cerere | Qd > Qs (P < P*) |
| Exces ofertă | Qs > Qd (P > P*) |

---

## 2. Elasticități

### Elasticitatea Preț a Cererii
\`\`\`
Ep = (ΔQ/Q) / (ΔP/P) = (dQ/dP) · (P/Q)
\`\`\`

### Elasticitatea Venit
\`\`\`
Ev = (ΔQ/Q) / (ΔV/V)
\`\`\`
- Ev > 1: bun de lux
- 0 < Ev < 1: bun normal necesar
- Ev < 0: bun inferior

### Elasticitatea Încrucișată
\`\`\`
Exy = (ΔQx/Qx) / (ΔPy/Py)
\`\`\`
- Exy > 0: bunuri substituibile
- Exy < 0: bunuri complementare

---

## 3. Surplusuri

\`\`\`
Surplus Consumator = (1/2) · (Pmax - P*) · Q*

Surplus Producător = (1/2) · (P* - Pmin) · Q*

Surplus Total = SC + SP
\`\`\`

---

## 4. Teoria Consumatorului

### Utilitatea Marginală
\`\`\`
Um = ΔU / ΔQ = dU/dQ
\`\`\`

### Condiția de Optim
\`\`\`
Uma/Pa = Umb/Pb = ... = λ (utilitatea marginală a banului)
\`\`\`

### Restricția Bugetară
\`\`\`
Pa·Qa + Pb·Qb = V (venitul)
\`\`\`

---

## 5. Teoria Producătorului

### Funcția de Producție
\`\`\`
Q = f(K, L)  unde K = capital, L = muncă
\`\`\`

### Productivități
\`\`\`
Productivitate Medie: PM = Q/L
Productivitate Marginală: Pm = ΔQ/ΔL = dQ/dL
\`\`\`

### Costuri
| Cost | Formula |
|------|---------|
| Cost Total | CT = CF + CV |
| Cost Mediu | CM = CT/Q |
| Cost Marginal | Cm = ΔCT/ΔQ |
| Cost Variabil Mediu | CVM = CV/Q |

---

## 6. Structuri de Piață

| Structură | Nr. Firme | Produs | Bariere | Preț |
|-----------|-----------|--------|---------|------|
| Concurență perfectă | Foarte multe | Omogen | Nu | P = Cm |
| Monopol | 1 | Unic | Da | P > Cm |
| Oligopol | Puține | Diferențiat | Ridicate | Strategic |
| Conc. monopolistică | Multe | Diferențiat | Slabe | P > Cm |

---

## 7. Maximizare Profit

### Concurență Perfectă
\`\`\`
Cm = P (prețul pieței)
Profit = (P - CM) · Q
\`\`\`

### Monopol
\`\`\`
Cm = Vm (venitul marginal)
Vm = P · (1 - 1/|Ep|)
\`\`\`

---

## 8. Taxe și Subvenții

### Taxă pe Producător
- Oferta se deplasează în sus cu valoarea taxei
- Prețul crește, cantitatea scade

### Incidența Fiscală
\`\`\`
Partea consumatorului: Ed / (Ed + Es)
Partea producătorului: Es / (Ed + Es)
\`\`\`

---

## 9. Reguli Rapide

✅ **Cerere elastică (|Ep| > 1):**
- Scade prețul → crește venitul total

✅ **Cerere inelastică (|Ep| < 1):**
- Crește prețul → crește venitul total

✅ **La maximum profit:**
- Vm = Cm (întotdeauna!)

✅ **Break-even point:**
- CM = P (profit zero)

---

> 🎓 **Succes la examen!**
`
  },

  // ============ BTI (Bazele Tehnologiei Informației) ============
  {
    title: "BTI - Curs 1: Sisteme de Numerație și Conversii",
    description: "Introducere în sistemele de numerație: binar, octal, hexazecimal și conversii între baze.",
    subject: "Bazele Tehnologiei Informatiei",
    faculty: "CSIE",
    year: 1,
    content: `# Sisteme de Numerație și Conversii

## Introducere

Calculatoarele folosesc **sistemul binar** (baza 2) pentru reprezentarea informației, dar oamenii preferă sistemele zecimal, octal sau hexazecimal pentru o mai bună lizibilitate.

---

## 1. Sistemele de Numerație

### Sistem Zecimal (Baza 10)
Cifre: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9

\`\`\`
Exemplu: 347₁₀ = 3·10² + 4·10¹ + 7·10⁰
                = 300 + 40 + 7 = 347
\`\`\`

### Sistem Binar (Baza 2)
Cifre: 0, 1

\`\`\`
Exemplu: 1011₂ = 1·2³ + 0·2² + 1·2¹ + 1·2⁰
               = 8 + 0 + 2 + 1 = 11₁₀
\`\`\`

### Sistem Octal (Baza 8)
Cifre: 0, 1, 2, 3, 4, 5, 6, 7

\`\`\`
Exemplu: 157₈ = 1·8² + 5·8¹ + 7·8⁰
              = 64 + 40 + 7 = 111₁₀
\`\`\`

### Sistem Hexazecimal (Baza 16)
Cifre: 0-9, A(10), B(11), C(12), D(13), E(14), F(15)

\`\`\`
Exemplu: 2AF₁₆ = 2·16² + 10·16¹ + 15·16⁰
               = 512 + 160 + 15 = 687₁₀
\`\`\`

---

## 2. Conversii din Baza 10

### Metoda împărțirilor succesive

**Exemplu: 25₁₀ → binar**
\`\`\`
25 : 2 = 12 rest 1
12 : 2 = 6  rest 0
6  : 2 = 3  rest 0
3  : 2 = 1  rest 1
1  : 2 = 0  rest 1

Citim resturile de jos în sus: 25₁₀ = 11001₂
\`\`\`

**Exemplu: 156₁₀ → hexazecimal**
\`\`\`
156 : 16 = 9  rest 12 (C)
9   : 16 = 0  rest 9

156₁₀ = 9C₁₆
\`\`\`

---

## 3. Conversii către Baza 10

### Metoda pozițională

**Exemplu: 1101₂ → zecimal**
\`\`\`
1101₂ = 1·2³ + 1·2² + 0·2¹ + 1·2⁰
      = 8 + 4 + 0 + 1 = 13₁₀
\`\`\`

**Exemplu: A5₁₆ → zecimal**
\`\`\`
A5₁₆ = 10·16¹ + 5·16⁰
     = 160 + 5 = 165₁₀
\`\`\`

---

## 4. Conversii Directe

### Binar ↔ Octal
Grupăm câte **3 biți** (de la dreapta la stânga)

\`\`\`
110 101 011₂ = 6 5 3₈

Verificare: 653₈ = 6·64 + 5·8 + 3 = 384 + 40 + 3 = 427₁₀
           110101011₂ = 256 + 128 + 32 + 8 + 2 + 1 = 427₁₀ ✓
\`\`\`

### Binar ↔ Hexazecimal
Grupăm câte **4 biți**

\`\`\`
1010 1111₂ = A F₁₆

1010₂ = 10₁₀ = A
1111₂ = 15₁₀ = F
\`\`\`

---

## 5. Tabel de Referință Rapid

| Zecimal | Binar | Octal | Hexa |
|---------|-------|-------|------|
| 0 | 0000 | 0 | 0 |
| 1 | 0001 | 1 | 1 |
| 2 | 0010 | 2 | 2 |
| 3 | 0011 | 3 | 3 |
| 4 | 0100 | 4 | 4 |
| 5 | 0101 | 5 | 5 |
| 6 | 0110 | 6 | 6 |
| 7 | 0111 | 7 | 7 |
| 8 | 1000 | 10 | 8 |
| 9 | 1001 | 11 | 9 |
| 10 | 1010 | 12 | A |
| 11 | 1011 | 13 | B |
| 12 | 1100 | 14 | C |
| 13 | 1101 | 15 | D |
| 14 | 1110 | 16 | E |
| 15 | 1111 | 17 | F |

---

## 6. Reprezentarea Numerelor Negative

### Complement față de 2 (Two's Complement)

Pentru a reprezenta -N pe n biți:
1. Scriem N în binar
2. Inversăm toți biții
3. Adunăm 1

**Exemplu: -5 pe 8 biți**
\`\`\`
5₁₀ = 00000101₂
Inversare: 11111010
Adunăm 1:  11111011₂ = -5
\`\`\`

**Verificare:** 5 + (-5) = 00000101 + 11111011 = 00000000 ✓

---

> 💡 **Tips:** Memorați tabelul 0-15 pentru conversii rapide!
`
  },
  {
    title: "BTI - Curs 2: Arhitectura Calculatoarelor",
    description: "Componentele hardware ale unui calculator: procesor, memorie, dispozitive I/O și magistrale.",
    subject: "Bazele Tehnologiei Informatiei",
    faculty: "CSIE",
    year: 1,
    content: `# Arhitectura Calculatoarelor

## Model von Neumann

Arhitectura **von Neumann** definește structura de bază a calculatoarelor moderne, cu următoarele componente principale:

1. **Unitatea Centrală de Procesare (CPU)**
2. **Memoria**
3. **Dispozitive de Intrare/Ieșire (I/O)**
4. **Magistrale (Bus)**

---

## 1. Unitatea Centrală de Procesare (CPU)

### Componente

#### Unitatea de Control (CU)
- Decodifică instrucțiunile
- Coordonează componentele
- Generează semnale de control

#### Unitatea Aritmetico-Logică (ALU)
- Operații aritmetice: +, -, *, /
- Operații logice: AND, OR, NOT, XOR
- Comparații

#### Registre
\`\`\`
- Program Counter (PC): adresa următoarei instrucțiuni
- Instruction Register (IR): instrucțiunea curentă
- Accumulator (ACC): rezultate intermediare
- Status Register: flag-uri (Zero, Carry, Overflow)
\`\`\`

### Ciclul Fetch-Decode-Execute
\`\`\`
1. FETCH: Se citește instrucțiunea din memorie (adresa din PC)
2. DECODE: CU decodifică instrucțiunea
3. EXECUTE: ALU execută operația
4. STORE: Se salvează rezultatul
5. PC = PC + 1 (se trece la următoarea instrucțiune)
\`\`\`

---

## 2. Memoria

### Ierarhia Memoriei

\`\`\`
         Registre        ← Cea mai rapidă, cea mai mică
            ↓
        Cache L1
            ↓
        Cache L2
            ↓
        Cache L3
            ↓
     Memorie RAM (principală)
            ↓
   Hard Disk / SSD (secundară)
            ↓
      Cloud / Tape        ← Cea mai lentă, cea mai mare
\`\`\`

### Tipuri de Memorie

| Tip | Caracteristici | Volatilă |
|-----|----------------|----------|
| RAM | Read/Write, rapidă | Da |
| ROM | Read-Only, firmware | Nu |
| Cache | Ultra-rapidă, mică | Da |
| Flash | Non-volatilă, SSD | Nu |

### Capacitate și Adresare
\`\`\`
Cu n biți de adresă → 2ⁿ locații adresabile

Exemplu: 32 biți → 2³² = 4 GB adresabili
         64 biți → 2⁶⁴ = 16 EB (exabytes) teoretic
\`\`\`

---

## 3. Magistrale (Bus)

### Tipuri

1. **Magistrala de Date** - transferă datele
   - Lățime: 8, 16, 32, 64 biți
   
2. **Magistrala de Adrese** - specifică locația
   - Determină memoria adresabilă
   
3. **Magistrala de Control** - semnale de control
   - Read/Write, Clock, Interrupt

### Caracteristici
\`\`\`
Bandă = Lățime × Frecvență

Exemplu: Bus 64 biți @ 100 MHz
Bandă = 64 biți × 100 MHz = 6.4 Gbps = 800 MB/s
\`\`\`

---

## 4. Dispozitive I/O

### Clasificare

**Intrare:**
- Tastatură, mouse, scanner
- Microfon, cameră
- Senzori

**Ieșire:**
- Monitor, imprimantă
- Boxe
- Actuatori

**Intrare/Ieșire:**
- Hard disk, SSD
- Placa de rețea
- Touchscreen

### Comunicare I/O

\`\`\`
1. Polling (interogare periodică) - ineficient
2. Întreruperi (Interrupts) - eficient
3. DMA (Direct Memory Access) - cel mai rapid
\`\`\`

---

## 5. Performanța Procesorului

### Frecvența de Ceas
\`\`\`
1 GHz = 10⁹ cicluri/secundă

Timp per ciclu = 1/frecvență
La 3 GHz: 1/3×10⁹ = 0.33 nanosecunde
\`\`\`

### MIPS (Millions of Instructions Per Second)
\`\`\`
MIPS = (Nr. instrucțiuni) / (Timp × 10⁶)
     = Frecvență / (CPI × 10⁶)

unde CPI = Cycles Per Instruction
\`\`\`

### Legea lui Amdahl
\`\`\`
Speedup = 1 / ((1-P) + P/S)

P = fracțiunea paralelizabilă
S = speedup-ul părții paralele
\`\`\`

---

## 6. Arhitecturi Moderne

### CISC vs RISC

| CISC | RISC |
|------|------|
| Instrucțiuni complexe | Instrucțiuni simple |
| Multe moduri de adresare | Puține moduri |
| Lungime variabilă | Lungime fixă |
| Ex: x86, x64 | Ex: ARM, MIPS |

### Multi-core
\`\`\`
CPU modern = multiple nuclee (cores)
- Dual-core: 2 nuclee
- Quad-core: 4 nuclee
- Octa-core: 8 nuclee

Fiecare nucleu poate executa instrucțiuni independent
\`\`\`

---

> 📝 **Pentru examen:** Înțelegeți ciclul Fetch-Decode-Execute și ierarhia memoriei!
`
  },
  {
    title: "BTI - Seminar: Exerciții și Aplicații Practice",
    description: "Exerciții practice pentru BTI: conversii, operații binare și probleme hardware.",
    subject: "Bazele Tehnologiei Informatiei",
    faculty: "CSIE",
    year: 1,
    content: `# Seminar BTI: Exerciții Practice

## Set 1: Conversii între Baze

### Exercițiul 1
Convertiți 234₁₀ în binar, octal și hexazecimal.

**Rezolvare:**

**Binar (împărțiri succesive la 2):**
\`\`\`
234 : 2 = 117 rest 0
117 : 2 = 58  rest 1
58  : 2 = 29  rest 0
29  : 2 = 14  rest 1
14  : 2 = 7   rest 0
7   : 2 = 3   rest 1
3   : 2 = 1   rest 1
1   : 2 = 0   rest 1

234₁₀ = 11101010₂
\`\`\`

**Octal (grupăm câte 3 biți):**
\`\`\`
011 101 010₂ = 352₈

Verificare: 3·64 + 5·8 + 2 = 192 + 40 + 2 = 234 ✓
\`\`\`

**Hexazecimal (grupăm câte 4 biți):**
\`\`\`
1110 1010₂ = EA₁₆

E = 14, A = 10
14·16 + 10 = 224 + 10 = 234 ✓
\`\`\`

---

### Exercițiul 2
Convertiți 2B7₁₆ în zecimal și binar.

**Rezolvare:**

**Zecimal:**
\`\`\`
2B7₁₆ = 2·16² + 11·16¹ + 7·16⁰
      = 2·256 + 11·16 + 7
      = 512 + 176 + 7 = 695₁₀
\`\`\`

**Binar:**
\`\`\`
2 = 0010
B = 1011
7 = 0111

2B7₁₆ = 001010110111₂
\`\`\`

---

## Set 2: Operații în Binar

### Exercițiul 3
Efectuați adunarea: 10110₂ + 11011₂

**Rezolvare:**
\`\`\`
   10110
+  11011
--------
  110001

Verificare: 22 + 27 = 49
110001₂ = 32 + 16 + 1 = 49 ✓
\`\`\`

### Exercițiul 4
Efectuați scăderea folosind complement față de 2: 25 - 13 (pe 8 biți)

**Rezolvare:**
\`\`\`
25₁₀ = 00011001₂
13₁₀ = 00001101₂

Complement față de 2 pentru 13:
  00001101
  11110010 (inversare)
+ 00000001
----------
  11110011 = -13

Acum adunăm 25 + (-13):
  00011001
+ 11110011
----------
  00001100 = 12₁₀ ✓
\`\`\`

---

## Set 3: Reprezentarea Datelor

### Exercițiul 5
Reprezentați -45 în complement față de 2 pe 8 biți.

**Rezolvare:**
\`\`\`
Pasul 1: 45₁₀ = 00101101₂
Pasul 2: Inversăm: 11010010
Pasul 3: Adunăm 1: 11010011

-45₁₀ = 11010011₂
\`\`\`

### Exercițiul 6
Ce număr zecimal reprezintă 11100101₂ dacă folosim complement față de 2?

**Rezolvare:**
\`\`\`
Bitul de semn = 1 → număr negativ

Pasul 1: Scădem 1: 11100100
Pasul 2: Inversăm: 00011011
Pasul 3: Valoare = 16 + 8 + 2 + 1 = 27

Răspuns: -27
\`\`\`

---

## Set 4: Probleme Hardware

### Exercițiul 7
Un procesor are adrese pe 24 biți. Cât de multă memorie poate adresa?

**Rezolvare:**
\`\`\`
Memorie adresabilă = 2²⁴ bytes
                   = 16.777.216 bytes
                   = 16 MB
\`\`\`

### Exercițiul 8
Un calculator are o magistrală de date de 32 biți care funcționează la 400 MHz. Calculați banda maximă.

**Rezolvare:**
\`\`\`
Bandă = Lățime × Frecvență
      = 32 biți × 400 × 10⁶ Hz
      = 12.800 × 10⁶ biți/s
      = 12.800 Mbps
      = 1.600 MB/s
      = 1.56 GB/s
\`\`\`

### Exercițiul 9
Un program execută 2×10⁹ instrucțiuni. CPU-ul funcționează la 2.5 GHz cu CPI mediu de 1.5. Cât durează execuția?

**Rezolvare:**
\`\`\`
Număr cicluri = Instrucțiuni × CPI
             = 2×10⁹ × 1.5
             = 3×10⁹ cicluri

Timp = Cicluri / Frecvență
     = 3×10⁹ / 2.5×10⁹
     = 1.2 secunde
\`\`\`

---

## Set 5: Operații Logice

### Exercițiul 10
Efectuați operațiile logice pe biți pentru A = 10110₂ și B = 11001₂

**Rezolvare:**
\`\`\`
A AND B:
  10110
& 11001
-------
  10000

A OR B:
  10110
| 11001
-------
  11111

A XOR B:
  10110
^ 11001
-------
  01111

NOT A:
  ~10110
-------
  01001
\`\`\`

---

> 💡 **Sfat:** Întotdeauna verificați rezultatele convertind înapoi în zecimal!
`
  },

  // ============ PROGRAMARE ============
  {
    title: "Programare C++ - Curs 1: Introducere și Sintaxa de Bază",
    description: "Primii pași în C++: structura unui program, variabile, tipuri de date și operatori.",
    subject: "Programare",
    faculty: "CSIE",
    year: 1,
    content: `# Introducere în Programarea C++

## 1. Primul Program

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
\`\`\`

### Explicație
- \`#include <iostream>\` - biblioteca pentru intrare/ieșire
- \`using namespace std;\` - folosim spațiul de nume standard
- \`int main()\` - funcția principală, punctul de start
- \`cout <<\` - afișează pe ecran
- \`return 0;\` - programul s-a terminat cu succes

---

## 2. Variabile și Tipuri de Date

### Tipuri Fundamentale

| Tip | Descriere | Dimensiune | Exemplu |
|-----|-----------|------------|---------|
| int | Întreg | 4 bytes | -2147483648 la 2147483647 |
| float | Zecimal | 4 bytes | 3.14f |
| double | Zecimal precizie dublă | 8 bytes | 3.14159265359 |
| char | Caracter | 1 byte | 'A' |
| bool | Boolean | 1 byte | true/false |
| string | Șir caractere | variabil | "Hello" |

### Declarare și Inițializare

\`\`\`cpp
// Declarare
int varsta;
double salariu;

// Inițializare
varsta = 20;
salariu = 2500.50;

// Declarare cu inițializare
int an = 2024;
char litera = 'X';
bool estePar = true;
string nume = "Ion";
\`\`\`

### Constante

\`\`\`cpp
const double PI = 3.14159;
const int MAX_STUDENTI = 100;
\`\`\`

---

## 3. Operatori

### Operatori Aritmetici
\`\`\`cpp
int a = 10, b = 3;

cout << a + b;  // 13 (adunare)
cout << a - b;  // 7  (scădere)
cout << a * b;  // 30 (înmulțire)
cout << a / b;  // 3  (împărțire întreagă)
cout << a % b;  // 1  (restul împărțirii)
\`\`\`

### Operatori de Comparare
\`\`\`cpp
a == b  // egal
a != b  // diferit
a < b   // mai mic
a > b   // mai mare
a <= b  // mai mic sau egal
a >= b  // mai mare sau egal
\`\`\`

### Operatori Logici
\`\`\`cpp
&&  // AND (și)
||  // OR (sau)
!   // NOT (negare)

// Exemplu
if (varsta >= 18 && arePermis) {
    cout << "Poate conduce";
}
\`\`\`

### Operatori de Incrementare
\`\`\`cpp
int x = 5;
x++;     // x devine 6 (post-incrementare)
++x;     // x devine 7 (pre-incrementare)
x--;     // x devine 6 (post-decrementare)
\`\`\`

---

## 4. Intrare/Ieșire

### Afișare (cout)
\`\`\`cpp
int nota = 10;
string materie = "C++";

cout << "Nota la " << materie << " este " << nota << endl;
// Afișează: Nota la C++ este 10
\`\`\`

### Citire (cin)
\`\`\`cpp
int varsta;
string nume;

cout << "Introdu numele: ";
cin >> nume;

cout << "Introdu varsta: ";
cin >> varsta;

cout << "Salut, " << nume << "! Ai " << varsta << " ani.";
\`\`\`

### Citire linie completă (getline)
\`\`\`cpp
string adresa;
cout << "Adresa completa: ";
getline(cin, adresa);  // citește inclusiv spațiile
\`\`\`

---

## 5. Exemplu Complet

\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    // Declarări
    string nume;
    int varsta;
    double medie;
    
    // Citire date
    cout << "Nume: ";
    cin >> nume;
    
    cout << "Varsta: ";
    cin >> varsta;
    
    cout << "Media: ";
    cin >> medie;
    
    // Afișare rezultat
    cout << "\\n--- Fisa Student ---\\n";
    cout << "Nume: " << nume << endl;
    cout << "Varsta: " << varsta << " ani" << endl;
    cout << "Media: " << medie << endl;
    
    // Verificare promovare
    if (medie >= 5.0) {
        cout << "Status: PROMOVAT" << endl;
    } else {
        cout << "Status: NEPROMOVAT" << endl;
    }
    
    return 0;
}
\`\`\`

---

> 💡 **Sfat:** Compilați și rulați codul frecvent pentru a înțelege cum funcționează!
`
  },
  {
    title: "Programare C++ - Curs 2: Structuri de Control",
    description: "Instrucțiuni condiționale (if, switch) și bucle (for, while, do-while) în C++.",
    subject: "Programare",
    faculty: "CSIE",
    year: 1,
    content: `# Structuri de Control în C++

## 1. Instrucțiuni Condiționale

### If-Else

\`\`\`cpp
int nota = 8;

if (nota >= 9) {
    cout << "Excelent!";
} else if (nota >= 7) {
    cout << "Bine!";
} else if (nota >= 5) {
    cout << "Suficient";
} else {
    cout << "Nepromovat";
}
\`\`\`

### Operator Ternar
\`\`\`cpp
int varsta = 20;
string categorie = (varsta >= 18) ? "Adult" : "Minor";
// Echivalent cu if-else, dar pe o singură linie
\`\`\`

### Switch

\`\`\`cpp
int luna = 3;

switch (luna) {
    case 1:
        cout << "Ianuarie";
        break;
    case 2:
        cout << "Februarie";
        break;
    case 3:
        cout << "Martie";
        break;
    // ... alte cazuri
    default:
        cout << "Luna invalida";
}
\`\`\`

> ⚠️ **Atenție:** Nu uitați \`break\`! Altfel se execută și cazurile următoare.

---

## 2. Bucle (Loops)

### For Loop

Structură: \`for (inițializare; condiție; incrementare)\`

\`\`\`cpp
// Afișează numerele de la 1 la 5
for (int i = 1; i <= 5; i++) {
    cout << i << " ";
}
// Output: 1 2 3 4 5
\`\`\`

**Exemplu: Suma numerelor de la 1 la n**
\`\`\`cpp
int n = 100, suma = 0;
for (int i = 1; i <= n; i++) {
    suma += i;
}
cout << "Suma: " << suma;  // 5050
\`\`\`

### While Loop

Se execută **cât timp** condiția este adevărată.

\`\`\`cpp
int i = 1;
while (i <= 5) {
    cout << i << " ";
    i++;
}
// Output: 1 2 3 4 5
\`\`\`

**Exemplu: Citire până la valoare specială**
\`\`\`cpp
int numar;
cout << "Introdu numere (0 pentru stop): ";

cin >> numar;
while (numar != 0) {
    cout << "Ai introdus: " << numar << endl;
    cin >> numar;
}
\`\`\`

### Do-While Loop

Se execută **cel puțin o dată**, apoi verifică condiția.

\`\`\`cpp
int alegere;
do {
    cout << "\\nMeniu:\\n";
    cout << "1. Optiune A\\n";
    cout << "2. Optiune B\\n";
    cout << "0. Iesire\\n";
    cout << "Alegere: ";
    cin >> alegere;
    
    if (alegere == 1) cout << "Ai ales A";
    if (alegere == 2) cout << "Ai ales B";
} while (alegere != 0);
\`\`\`

---

## 3. Control Flow

### Break
Iese din bucla curentă.

\`\`\`cpp
for (int i = 1; i <= 10; i++) {
    if (i == 5) break;  // Se oprește la 5
    cout << i << " ";
}
// Output: 1 2 3 4
\`\`\`

### Continue
Sare la următoarea iterație.

\`\`\`cpp
for (int i = 1; i <= 5; i++) {
    if (i == 3) continue;  // Sare peste 3
    cout << i << " ";
}
// Output: 1 2 4 5
\`\`\`

---

## 4. Bucle Imbricate

\`\`\`cpp
// Tabla înmulțirii
for (int i = 1; i <= 10; i++) {
    for (int j = 1; j <= 10; j++) {
        cout << i * j << "\\t";
    }
    cout << endl;
}
\`\`\`

**Exemplu: Triunghi de stele**
\`\`\`cpp
int n = 5;
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= i; j++) {
        cout << "* ";
    }
    cout << endl;
}
/*
Output:
* 
* * 
* * * 
* * * * 
* * * * * 
*/
\`\`\`

---

## 5. Probleme Clasice

### Verificare Număr Prim
\`\`\`cpp
int n = 17;
bool estePrim = true;

if (n < 2) estePrim = false;
else {
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            estePrim = false;
            break;
        }
    }
}

cout << n << (estePrim ? " este prim" : " nu este prim");
\`\`\`

### Factorial
\`\`\`cpp
int n = 5;
long long factorial = 1;

for (int i = 2; i <= n; i++) {
    factorial *= i;
}

cout << n << "! = " << factorial;  // 5! = 120
\`\`\`

### Fibonacci
\`\`\`cpp
int n = 10, a = 0, b = 1;

cout << "Fibonacci: ";
for (int i = 0; i < n; i++) {
    cout << a << " ";
    int temp = a + b;
    a = b;
    b = temp;
}
// Output: 0 1 1 2 3 5 8 13 21 34
\`\`\`

---

> 🎯 **Exercițiu:** Implementați un program care verifică dacă un număr este palindrom!
`
  },
  {
    title: "Programare C++ - Seminar: Probleme Rezolvate",
    description: "Exerciții practice de programare C++ cu soluții complete și explicații.",
    subject: "Programare",
    faculty: "CSIE",
    year: 1,
    content: `# Seminar Programare: Probleme Rezolvate

## Problema 1: Calculator Simplu

### Cerință
Creați un calculator care efectuează operații aritmetice de bază.

### Soluție
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    double a, b;
    char op;
    
    cout << "Introdu primul numar: ";
    cin >> a;
    
    cout << "Introdu operatorul (+, -, *, /): ";
    cin >> op;
    
    cout << "Introdu al doilea numar: ";
    cin >> b;
    
    double rezultat;
    bool valid = true;
    
    switch (op) {
        case '+':
            rezultat = a + b;
            break;
        case '-':
            rezultat = a - b;
            break;
        case '*':
            rezultat = a * b;
            break;
        case '/':
            if (b != 0) {
                rezultat = a / b;
            } else {
                cout << "Eroare: Impartire la zero!" << endl;
                valid = false;
            }
            break;
        default:
            cout << "Operator invalid!" << endl;
            valid = false;
    }
    
    if (valid) {
        cout << a << " " << op << " " << b << " = " << rezultat << endl;
    }
    
    return 0;
}
\`\`\`

---

## Problema 2: Găsirea Maximului din n Numere

### Cerință
Citește n numere și afișează valoarea maximă.

### Soluție
\`\`\`cpp
#include <iostream>
#include <climits>  // pentru INT_MIN
using namespace std;

int main() {
    int n;
    cout << "Cate numere? ";
    cin >> n;
    
    int maxim = INT_MIN;  // cea mai mică valoare int posibilă
    
    for (int i = 1; i <= n; i++) {
        int x;
        cout << "Numarul " << i << ": ";
        cin >> x;
        
        if (x > maxim) {
            maxim = x;
        }
    }
    
    cout << "Maximul este: " << maxim << endl;
    return 0;
}
\`\`\`

---

## Problema 3: CMMDC (Algoritmul lui Euclid)

### Cerință
Calculați cel mai mare divizor comun a două numere.

### Soluție
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cout << "Introdu doua numere: ";
    cin >> a >> b;
    
    int copieA = a, copieB = b;  // Păstrăm valorile originale
    
    // Algoritmul lui Euclid
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    
    cout << "CMMDC(" << copieA << ", " << copieB << ") = " << a << endl;
    return 0;
}
\`\`\`

**Trace pentru CMMDC(48, 18):**
\`\`\`
a=48, b=18 → r = 48 % 18 = 12
a=18, b=12 → r = 18 % 12 = 6
a=12, b=6  → r = 12 % 6 = 0
a=6, b=0   → STOP

CMMDC = 6
\`\`\`

---

## Problema 4: Inversarea unui Număr

### Cerință
Inversați cifrele unui număr întreg.

### Soluție
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Introdu un numar: ";
    cin >> n;
    
    int inversat = 0;
    int original = n;
    
    while (n != 0) {
        int cifra = n % 10;         // Extrage ultima cifră
        inversat = inversat * 10 + cifra;  // Adaugă cifra
        n = n / 10;                 // Elimină ultima cifră
    }
    
    cout << "Inversatul lui " << original << " este " << inversat << endl;
    return 0;
}
\`\`\`

---

## Problema 5: Verificare Palindrom

### Cerință
Verificați dacă un număr este palindrom.

### Soluție
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Introdu un numar: ";
    cin >> n;
    
    int original = n;
    int inversat = 0;
    
    while (n > 0) {
        inversat = inversat * 10 + n % 10;
        n /= 10;
    }
    
    if (original == inversat) {
        cout << original << " ESTE palindrom" << endl;
    } else {
        cout << original << " NU ESTE palindrom" << endl;
    }
    
    return 0;
}
\`\`\`

---

## Problema 6: Numere Prime până la N

### Cerință
Afișați toate numerele prime până la n.

### Soluție
\`\`\`cpp
#include <iostream>
using namespace std;

bool estePrim(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    
    for (int i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    int n;
    cout << "Limita superioara: ";
    cin >> n;
    
    cout << "Numere prime pana la " << n << ": ";
    for (int i = 2; i <= n; i++) {
        if (estePrim(i)) {
            cout << i << " ";
        }
    }
    cout << endl;
    
    return 0;
}
\`\`\`

---

## Problema 7: Triunghi Pascal

### Cerință
Afișați primele n linii ale triunghiului lui Pascal.

### Soluție
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Numarul de linii: ";
    cin >> n;
    
    for (int i = 0; i < n; i++) {
        int val = 1;
        
        // Spații pentru aliniere
        for (int s = 0; s < n - i - 1; s++) {
            cout << "  ";
        }
        
        for (int j = 0; j <= i; j++) {
            cout << val << "   ";
            val = val * (i - j) / (j + 1);
        }
        cout << endl;
    }
    
    return 0;
}
/*
Output pentru n=5:
        1   
      1   1   
    1   2   1   
  1   3   3   1   
1   4   6   4   1   
*/
\`\`\`

---

> 💡 **Sfat:** Testați fiecare program cu mai multe seturi de date!
`
  },

  // ============ SPORT ============
  {
    title: "Educație Fizică - Curs 1: Beneficiile Exercițiului Fizic",
    description: "Impactul activității fizice asupra sănătății: beneficii fizice, mentale și sociale.",
    subject: "Sport",
    faculty: "CSIE",
    year: 1,
    content: `# Beneficiile Exercițiului Fizic pentru Studenți

## Introducere

Activitatea fizică regulată este esențială pentru sănătatea și performanța academică. Acest curs explorează beneficiile exercițiului fizic și oferă recomandări practice pentru studenți.

---

## 1. Beneficii Fizice

### Sistem Cardiovascular
- **Întărește inima** - pompează mai eficient
- **Scade tensiunea arterială**
- **Reduce colesterolul** LDL (rău), crește HDL (bun)
- **Previne bolile de inimă**

### Sistem Musculo-Scheletic
- **Crește forța musculară**
- **Îmbunătățește flexibilitatea**
- **Întărește oasele** (previne osteoporoza)
- **Îmbunătățește postura**

### Metabolism și Greutate
- **Accelerează metabolismul**
- **Ajută la controlul greutății**
- **Reglează glicemia**
- **Reduce riscul de diabet tip 2**

---

## 2. Beneficii Mentale și Cognitive

### Reducerea Stresului
\`\`\`
Exercițiu fizic → Eliberare de endorfine → Bunăstare
                → Reducere cortizol → Scădere stres
\`\`\`

### Îmbunătățirea Memoriei
Studiile arată că exercițiul fizic:
- Crește fluxul sanguin către creier
- Stimulează neurogeneza (formarea de neuroni noi)
- Îmbunătățește capacitatea de învățare cu **15-20%**

### Combaterea Depresiei și Anxietății
- La fel de eficient ca medicamentele pentru depresie ușoară
- Reduce simptomele anxietății
- Îmbunătățește calitatea somnului

### Concentrare și Productivitate
| Activitate | Efect asupra concentrării |
|------------|--------------------------|
| 30 min cardio dimineața | +23% productivitate |
| Pauze de mișcare | Resetează atenția |
| Exerciții regulate | Memorie îmbunătățită |

---

## 3. Beneficii Sociale

- **Dezvoltarea abilităților de echipă** (sporturi colective)
- **Crearea de prietenii** noi
- **Îmbunătățirea încrederii** în sine
- **Reducerea izolării sociale**

---

## 4. Recomandări pentru Studenți

### Cantitate Recomandată (OMS)
- **150 minute/săptămână** activitate moderată, SAU
- **75 minute/săptămână** activitate intensă
- **2 sesiuni/săptămână** de antrenament de forță

### Program Săptămânal Exemplu

| Zi | Activitate | Durată |
|----|-----------|--------|
| Luni | Alergare ușoară | 30 min |
| Marți | Exerciții de forță | 40 min |
| Miercuri | Pauză activă (stretching) | 15 min |
| Joi | Sport de echipă (baschet) | 60 min |
| Vineri | Înot sau ciclism | 45 min |
| Sâmbătă | Drumeție | 90 min |
| Duminică | Odihnă | - |

---

## 5. Sfaturi Practice

### Începeți Treptat
1. **Săptămâna 1-2:** 15 minute/zi
2. **Săptămâna 3-4:** 25 minute/zi
3. **Săptămâna 5+:** 30-45 minute/zi

### Integrare în Rutina de Student
- 🚶 Mergeți pe jos la cursuri
- 🚲 Folosiți bicicleta
- 🏃 Pauze active între ore (5 min stretching)
- 💪 Exerciții în cameră (fără echipament)

### Exerciții Fără Echipament

\`\`\`
Circuit de 15 minute:
1. Jumping Jacks - 1 minut
2. Flotări - 10-15 repetări
3. Genuflexiuni - 15 repetări
4. Plank - 30 secunde
5. Burpees - 10 repetări
6. Mountain Climbers - 1 minut

Repetați circuitul de 2-3 ori
\`\`\`

---

## 6. Prevenirea Accidentărilor

### Înainte de Antrenament
- ✅ Încălzire de 5-10 minute
- ✅ Hidratare adecvată
- ✅ Echipament potrivit

### După Antrenament
- ✅ Stretching 10 minute
- ✅ Rehidratare
- ✅ Alimentație adecvată

### Semne de Suprasolicitare
- ⚠️ Oboseală persistentă
- ⚠️ Dureri articulare/musculare
- ⚠️ Scăderea performanței
- ⚠️ Insomnie

---

> 🎯 **Obiectiv:** Găsiți o activitate fizică care vă place și transformați-o în obicei!
`
  },
  {
    title: "Sport - Seminar: Exerciții de Stretching și Mobilitate",
    description: "Ghid practic pentru exerciții de stretching și mobilitate, esențiale pentru sănătatea articulațiilor.",
    subject: "Sport",
    faculty: "CSIE",
    year: 1,
    content: `# Ghid de Stretching și Mobilitate

## De Ce Este Important Stretching-ul?

Pentru studenții care petrec ore în șir la birou sau la calculator, stretching-ul este esențial pentru:
- **Prevenirea durerilor de spate**
- **Menținerea flexibilității**
- **Îmbunătățirea posturii**
- **Reducerea tensiunii musculare**

---

## 1. Rutină de Dimineață (10 minute)

### Stretching pentru Coloană

**Cat-Cow Stretch**
\`\`\`
1. Poziție pe mâini și genunchi
2. Inspiră: Coboară burta, ridică capul (Cow)
3. Expiră: Arcuiește spatele în sus, bărbia spre piept (Cat)
4. Repetă 10 ori
\`\`\`

**Rotații Coloană**
\`\`\`
1. Șezând pe scaun, picioarele pe sol
2. Rotește trunchiul la dreapta, mâna pe spătarul scaunului
3. Menține 20-30 secunde
4. Repetă pe partea stângă
\`\`\`

### Stretching pentru Gât

\`\`\`
1. Înclină capul spre umărul drept (mâna ajută ușor)
2. Menține 20 secunde
3. Repetă pe partea stângă
4. Rotații lente ale capului (5 în fiecare direcție)
\`\`\`

---

## 2. Pauză Activă la Birou (5 minute)

Faceți aceste exerciții la fiecare 1-2 ore de stat la calculator:

### Exercițiul 1: Extensii Umeri
\`\`\`
1. Ridică brațele deasupra capului
2. Întrepătrunde degetele
3. Împinge palmele spre tavan
4. Menține 15 secunde
\`\`\`

### Exercițiul 2: Rotații Încheietură
\`\`\`
1. Întinde brațele în față
2. Rotește încheieturile (10 rotații fiecare direcție)
3. Deschide și închide pumnii (10 ori)
\`\`\`

### Exercițiul 3: Ridicări pe Vârfuri
\`\`\`
1. În picioare, lângă scaun (pentru echilibru)
2. Ridică-te pe vârfuri
3. Menține 3 secunde, coboară lent
4. Repetă 15 ori
\`\`\`

### Exercițiul 4: Flexii Șold (Standing)
\`\`\`
1. Ține-te de spătarul scaunului
2. Ridică genunchiul drept spre piept
3. Menține 10 secunde
4. Alternează picioarele (5 repetări fiecare)
\`\`\`

---

## 3. Rutină pentru Partea Inferioară (15 minute)

### Stretching Cvadriceps
\`\`\`
1. În picioare, trage călcâiul spre fese
2. Genunchii aliniați
3. Menține 30 secunde fiecare picior
\`\`\`

### Stretching Ischiogambieri
\`\`\`
1. Șezând pe podea, picioarele întinse
2. Înclină-te din șold spre vârfurile picioarelor
3. Menține 30 secunde
\`\`\`

### Stretching Șold (Pigeon Pose)
\`\`\`
1. Din poziție de flotare
2. Adu genunchiul drept spre mâna dreaptă
3. Întinde piciorul stâng în spate
4. Menține 30-60 secunde
5. Schimbă partea
\`\`\`

### Stretching Gambe
\`\`\`
1. Față în față cu peretele
2. Un picior în față (genunchi flexat)
3. Un picior în spate (întins)
4. Împinge călcâiul în podea
5. Menține 30 secunde fiecare picior
\`\`\`

---

## 4. Rutină înainte de Somn (10 minute)

### Child's Pose
\`\`\`
1. Genunchi pe podea, fese pe călcâie
2. Întinde brațele înainte, fruntea pe podea
3. Respiră adânc
4. Menține 1 minut
\`\`\`

### Reclined Spinal Twist
\`\`\`
1. Culcat pe spate
2. Trage genunchiul drept spre piept
3. Lasă-l să cadă peste corpul stâng
4. Privește spre dreapta
5. Menține 30 secunde, schimbă
\`\`\`

### Legs Up the Wall
\`\`\`
1. Culcat lângă perete
2. Ridică picioarele pe perete (90°)
3. Brațele relaxate lateral
4. Menține 5 minute (excelent pentru circulație!)
\`\`\`

---

## 5. Reguli Importante

### ✅ Fă Asta:
- Respiră profund în timpul stretching-ului
- Menține poziția 20-30 secunde (minimum)
- Mișcări lente și controlate
- Stretching după încălzire sau la sfârșitul zilei

### ❌ Evită Asta:
- Sărituri sau mișcări bruște
- Stretching pe mușchi reci
- Ignorarea durerii acute
- Compararea cu alții

---

## 6. Progres Săptămânal

| Săptămâna | Durată/sesiune | Sesiuni/săptămână | Obiectiv |
|-----------|---------------|-------------------|----------|
| 1-2 | 10 min | 3 | Obișnuire |
| 3-4 | 15 min | 4 | Flexibilitate de bază |
| 5-6 | 20 min | 5 | Îmbunătățire mobilitate |
| 7+ | 20-30 min | 6 | Menținere |

---

> 💆 **Sfat:** Stretching-ul nu trebuie să doară! Ar trebui să simți o tensiune plăcută, nu disconfort.
`
  },

  // ============ LIMBA ENGLEZĂ ============
  {
    title: "English for IT - Curs 1: Technical Vocabulary",
    description: "Essential English vocabulary for computer science and IT professionals.",
    subject: "Limba Engleza",
    faculty: "CSIE",
    year: 1,
    content: `# English for IT: Technical Vocabulary

## Introduction

As an IT student, you'll encounter English constantly - in documentation, code comments, error messages, and professional communication. This course covers essential vocabulary for the tech industry.

---

## 1. Hardware Vocabulary

### Computer Components

| Term | Pronunciation | Romanian |
|------|--------------|----------|
| CPU (Central Processing Unit) | /ˌsiː piː ˈjuː/ | Procesor |
| RAM (Random Access Memory) | /ræm/ | Memorie RAM |
| Hard Drive / HDD | /hɑːrd draɪv/ | Hard disk |
| SSD (Solid State Drive) | /ˌes es ˈdiː/ | Unitate SSD |
| Motherboard | /ˈmʌðərbɔːrd/ | Placă de bază |
| Graphics Card / GPU | /ˈɡræfɪks kɑːrd/ | Placă video |
| Power Supply Unit | /ˈpaʊər səˌplaɪ/ | Sursă de alimentare |
| Peripheral | /pəˈrɪfərəl/ | Periferic |

### Example Sentences
- *The CPU is overheating; we need better cooling.*
- *This laptop has 16GB of RAM and a 512GB SSD.*
- *The motherboard supports the latest DDR5 memory.*

---

## 2. Software Terminology

### Basic Terms

| Term | Definition |
|------|-----------|
| Operating System (OS) | Software that manages hardware (Windows, Linux, macOS) |
| Application / App | Software designed for end-users |
| Driver | Software that enables hardware communication |
| Firmware | Permanent software on hardware |
| Update / Patch | Software improvement or fix |
| Bug | An error in the code |
| Feature | A functionality of software |

### Development Terms

\`\`\`
Source code - The human-readable instructions
Compile - Convert source code to machine code
Debug - Find and fix errors
Deploy - Release software for use
Repository (repo) - Storage location for code
Branch - A parallel version of code
Merge - Combine code branches
Commit - Save changes to repository
\`\`\`

---

## 3. Programming Vocabulary

### Common Terms

| Term | Usage Example |
|------|---------------|
| Variable | "Declare a variable to store the user's name" |
| Function | "Call the function with two parameters" |
| Loop | "Use a for loop to iterate through the array" |
| Condition | "Add an if condition to check the input" |
| Array | "Store the values in an array" |
| Object | "Create a new user object" |
| Class | "Define a class for Student" |
| Method | "The class has a calculate() method" |
| Return | "The function returns an integer" |
| Parameter / Argument | "Pass the filename as a parameter" |

### Code Review Phrases
- *"This function needs refactoring."*
- *"Consider using a more descriptive variable name."*
- *"There's a bug in the loop condition."*
- *"The code lacks proper error handling."*
- *"Good use of comments - very readable!"*

---

## 4. Networking Vocabulary

| Term | Definition |
|------|-----------|
| IP Address | Unique identifier for a device on a network |
| DNS | Domain Name System - translates domains to IPs |
| Protocol | Rules for data communication (HTTP, TCP/IP) |
| Bandwidth | Maximum data transfer rate |
| Latency | Delay in data transmission |
| Firewall | Security system for network traffic |
| Router | Device that forwards data between networks |
| Server | Computer that provides services to other computers |
| Client | Computer that accesses services from a server |
| API | Application Programming Interface |

---

## 5. Professional Communication

### Email Phrases

**Starting:**
- *"I hope this email finds you well."*
- *"I'm writing to inquire about..."*
- *"Following up on our previous conversation..."*

**Requesting:**
- *"Could you please provide..."*
- *"I would appreciate it if you could..."*
- *"Would it be possible to..."*

**Closing:**
- *"Please let me know if you have any questions."*
- *"I look forward to hearing from you."*
- *"Thank you for your time and consideration."*

### Meeting Vocabulary
\`\`\`
Agenda - List of topics to discuss
Minutes - Written record of a meeting
Action item - Task assigned during meeting
Follow-up - Subsequent communication
Deadline - Time limit for completion
Milestone - Significant project checkpoint
Deliverable - Product or result to be delivered
Stakeholder - Person with interest in the project
\`\`\`

---

## 6. Common Expressions in IT

### Problem-Solving
- *"Let me look into that."* - Voi investiga.
- *"I'll get back to you."* - Revin cu un răspuns.
- *"That's a known issue."* - E o problemă cunoscută.
- *"Have you tried turning it off and on again?"* - Clasic IT support!

### Collaboration
- *"Let's sync up later."* - Să ne sincronizăm mai târziu.
- *"I'll ping you."* - Îți voi da un mesaj.
- *"Let's take this offline."* - Să discutăm separat.
- *"Keep me in the loop."* - Ține-mă la curent.

---

## 7. Practice Exercises

### Exercise 1: Fill in the Blanks
Complete with the correct term:

1. The _______ manages all hardware and software resources.
2. A _______ is an error in the program code.
3. We use _______ to store temporary data during program execution.
4. The _______ translates domain names to IP addresses.

**Answers:** 1. operating system, 2. bug, 3. RAM/variables, 4. DNS

### Exercise 2: Match the Terms
Match the term with its definition:
- Repository → Storage location for code
- Deploy → Release software for use
- Debug → Find and fix errors
- Commit → Save changes to version control

---

> 📚 **Tip:** Read technical documentation in English daily to improve naturally!
`
  },
  {
    title: "English - Seminar: Business Communication for IT",
    description: "Practical English for workplace communication: emails, meetings, and presentations.",
    subject: "Limba Engleza",
    faculty: "CSIE",
    year: 1,
    content: `# Business English for IT Professionals

## 1. Professional Email Writing

### Structure of a Professional Email

\`\`\`
To: recipient@company.com
Subject: [Clear, specific subject line]

Dear [Mr./Ms. Last Name] / Hello [First Name],

[Opening - Purpose of the email]

[Body - Main content, organized in paragraphs]

[Closing - Call to action or next steps]

Best regards,
[Your Name]
[Your Position]
[Contact Information]
\`\`\`

### Sample Emails

**Requesting Information**
\`\`\`
Subject: Request for API Documentation

Dear Development Team,

I hope this email finds you well. I am currently working 
on integrating your payment gateway into our e-commerce 
platform and would like to request the latest API 
documentation.

Specifically, I need information about:
- Authentication methods
- Endpoint specifications
- Error handling procedures

Could you please send me the documentation at your 
earliest convenience? If you need any additional 
information from my side, please let me know.

Thank you for your assistance.

Best regards,
Ana Popescu
Junior Developer
ana.popescu@company.ro
\`\`\`

**Reporting a Problem**
\`\`\`
Subject: Critical Bug in User Authentication Module

Hi Team,

I've identified a critical bug in the authentication 
module that needs immediate attention.

Issue: Users are unable to log in using Google OAuth.
Environment: Production server
Error: "Invalid token" message appears after redirect
Impact: Approximately 30% of our users are affected

Steps to reproduce:
1. Click "Sign in with Google"
2. Complete Google authentication
3. Observe the error on redirect

I've attached the error logs for reference. Please 
prioritize this issue as it's affecting live users.

Let me know if you need any additional information.

Regards,
Andrei
\`\`\`

---

## 2. Meeting Communication

### Useful Phrases

**Starting a Meeting:**
- *"Let's get started, shall we?"*
- *"Thank you all for joining today."*
- *"The purpose of this meeting is to..."*

**Giving Opinions:**
- *"In my opinion..."* / *"I think..."*
- *"From a technical standpoint..."*
- *"Based on my experience..."*
- *"If I may add..."*

**Agreeing:**
- *"I completely agree."*
- *"That's a valid point."*
- *"Exactly, I was thinking the same thing."*

**Disagreeing Politely:**
- *"I see your point, but..."*
- *"I understand, however..."*
- *"That's one way to look at it, but have you considered..."*
- *"I'm not sure I agree entirely..."*

**Asking for Clarification:**
- *"Could you elaborate on that?"*
- *"What exactly do you mean by...?"*
- *"I'm not sure I follow. Could you explain?"*
- *"Just to clarify..."*

**Summarizing:**
- *"So, to sum up..."*
- *"Let me make sure I understand..."*
- *"In conclusion..."*
- *"The key takeaways are..."*

---

## 3. Technical Presentations

### Structure

\`\`\`
1. INTRODUCTION (10%)
   - Greeting
   - Topic overview
   - Agenda

2. MAIN BODY (75%)
   - Background/Context
   - Problem Statement
   - Solution/Proposal
   - Technical Details
   - Benefits

3. CONCLUSION (15%)
   - Summary
   - Call to Action
   - Q&A
\`\`\`

### Transition Phrases

| Purpose | Phrases |
|---------|---------|
| Moving to next point | "Moving on to...", "Let's now look at..." |
| Adding information | "Furthermore...", "In addition..." |
| Contrasting | "However...", "On the other hand..." |
| Giving examples | "For instance...", "Such as..." |
| Summarizing | "In summary...", "To conclude..." |

### Handling Q&A

**When you know the answer:**
- *"That's a great question. The answer is..."*
- *"I'm glad you asked. Actually..."*

**When you need time:**
- *"That's an interesting point. Let me think..."*
- *"I'd need to verify that. Can I get back to you?"*

**When you don't know:**
- *"I don't have that information right now, but I'll find out."*
- *"That's beyond my area of expertise, but I can connect you with someone who knows."*

---

## 4. Common Mistakes to Avoid

### Grammar Issues

❌ **Wrong:** *"The software have many features."*
✅ **Correct:** *"The software has many features."*

❌ **Wrong:** *"I am working here since 2020."*
✅ **Correct:** *"I have been working here since 2020."*

❌ **Wrong:** *"Please revert back to me."*
✅ **Correct:** *"Please get back to me."*

### Formality Levels

| Too Casual | Professional |
|------------|-------------|
| Hey! | Hello / Dear... |
| Thanks! | Thank you for... |
| ASAP | At your earliest convenience |
| FYI | For your information |
| BTW | By the way / Additionally |

---

## 5. Practice Scenarios

### Scenario 1: Project Status Update

Write an email to your project manager updating them on:
- Completed tasks this week
- Current blockers
- Next week's plan

### Scenario 2: Technical Discussion

You disagree with a colleague's proposed solution. Practice:
- Acknowledging their point
- Presenting your alternative
- Finding common ground

### Scenario 3: Client Presentation

Prepare a 3-minute presentation about:
- A technical concept you know well
- Use proper structure and transitions
- Include a Q&A simulation

---

## 6. Vocabulary Building

### Tech Company Roles

| Role | Responsibilities |
|------|-----------------|
| Developer / Engineer | Writes code |
| QA (Quality Assurance) | Tests software |
| DevOps | Manages deployment and infrastructure |
| Product Manager | Defines product features |
| Scrum Master | Facilitates agile processes |
| UX Designer | Designs user experience |
| Data Analyst | Interprets data |
| System Administrator | Manages IT infrastructure |

### Project Terms
\`\`\`
Sprint - Fixed time period for work (usually 2 weeks)
Backlog - List of tasks to be completed
Stand-up - Daily short team meeting
Retrospective - Meeting to review completed work
MVP - Minimum Viable Product
POC - Proof of Concept
KPI - Key Performance Indicator
ROI - Return on Investment
\`\`\`

---

> 🎯 **Practice Daily:** Listen to tech podcasts, read documentation, write emails in English!
`
  }
];

export default function ContentSeeding() {
  const [isLoading, setIsLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSeedContent = async () => {
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fiți autentificat.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      
      for (const note of SAMPLE_NOTES) {
        const { error } = await supabase
          .from('notes')
          .insert({
            title: note.title,
            description: note.description,
            subject: note.subject,
            faculty: note.faculty,
            year: note.year,
            content: note.content,
            user_id: user.id
          });
        
        if (!error) {
          successCount++;
        } else {
          console.error(`Error inserting note "${note.title}":`, error);
        }
      }

      if (successCount > 0) {
        setSeeded(true);
        toast({
          title: "Conținut adăugat!",
          description: `${successCount} notițe demo au fost create cu succes.`
        });
      } else {
        toast({
          title: "Eroare",
          description: "Nu s-au putut adăuga notițele.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error seeding content:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la adăugarea conținutului.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Populare Conținut Demo
        </CardTitle>
        <CardDescription>
          Adaugă {SAMPLE_NOTES.length} notițe demo pentru toate materiile din Anul 1, Semestrul 1 (CSIE ASE): 
          Algebră, Microeconomie, BTI, Programare, Sport și Limba Engleză.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleSeedContent}
          disabled={isLoading || seeded}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Se adaugă notițele...
            </>
          ) : seeded ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Conținut adăugat!
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Adaugă {SAMPLE_NOTES.length} Notițe Demo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
