Perfetto — ora facciamo un **vero PRD (Product Requirements Document)**.
Questo è diverso dal documento tecnico che genererà Antigravity:
👉 il PRD serve a voi per non perdere la direzione mentre sviluppate.

Pensalo come la “bussola del progetto”.

---

# PRD — DOMUS

*Personal Property Expense Manager SaaS*

---

## 1. Visione del prodotto

Domus è una piattaforma SaaS che permette a privati di avere una visione chiara e centralizzata dei costi legati alla gestione della casa o degli immobili.

L’obiettivo non è gestire la contabilità, ma rendere evidente una cosa:

> quanto costa davvero vivere o possedere un immobile.

Domus diventa il “conto economico personale della casa”.

---

## 2. Problema

Oggi la gestione delle spese domestiche è frammentata:

* bollette via email
* documenti cartacei
* comunicazioni condominiali
* addebiti bancari
* affitti e manutenzioni

Questo causa:

* pagamenti dimenticati
* more e arretrati
* ansia finanziaria
* mancanza di controllo
* impossibilità di prevedere spese future

Gli utenti non hanno una dashboard unica.

---

## 3. Target utenti

### Primario

* 20–40 anni
* prima casa o affitto
* non organizzati finanziariamente
* usano il telefono per tutto

### Secondario

* proprietari di 2–5 immobili
* piccoli investitori immobiliari
* affitti brevi o lunghi

### NON target

* commercialisti
* amministratori condominiali
* aziende

---

## 4. Value Proposition

Domus permette di:

* non dimenticare scadenze
* sapere quanto costa una casa al mese
* prevedere spese
* avere controllo immediato

**In meno di 60 secondi l’utente capisce la sua situazione.**

---

## 5. Core Experience

Flusso ideale:

1. utente crea account
2. aggiunge casa
3. inserisce prime bollette
4. vede dashboard
5. riceve reminder
6. torna ogni settimana

Il valore deve arrivare entro 2 minuti.

---

## 6. Feature Set (MLP)

### 6.1 Gestione immobili

Creazione immobile con:

* nome
* indirizzo
* tipo (affitto/proprietà)
* note

Multi-immobile supportato.

---

### 6.2 Spese

Ogni spesa ha:

* immobile associato
* categoria
* importo
* data emissione
* scadenza
* stato pagata/non pagata
* ricorrente
* frequenza

---

### 6.3 Dashboard

Mostra:

* totale mese
* totale anno
* da pagare
* arretrate
* prossime scadenze
* costo medio casa
* breakdown categorie

---

### 6.4 Reminder

Email automatiche:

* prima della scadenza
* il giorno stesso

Se pagata → stop reminder

---

### 6.5 Statistiche

* trend spesa mensile
* costo medio abitazione
* variazioni nel tempo

---

## 7. Monetizzazione

### Free

* 1 immobile
* reminder limitati

### Pro (abbonamento)

* immobili illimitati
* reminder automatici
* statistiche complete

---

## 8. Metriche di successo

**Activation**
utente inserisce almeno 2 spese

**Retention**
utente ritorna entro 7 giorni

**Value moment**
utente consulta dashboard più di 3 volte

---

## 9. Requisiti UX

Il prodotto deve essere:

* più semplice di Excel
* mobile-first
* zero configurazioni
* comprensibile subito

Se serve tutorial → UX sbagliata.

---

## 10. Scope escluso (importante)

Non sviluppare ora:

* integrazione banca
* OCR bollette
* gestione contabile
* multiutente complesso
* gestione condominio professionale

---

## 11. Roadmap MLP

### Fase 1

Auth + immobili

### Fase 2

Spese CRUD

### Fase 3

Dashboard

### Fase 4

Reminder email

### Fase 5

Abbonamento

---

## 12. Rischi

**Rischio principale:** prodotto troppo complesso
→ soluzione: limitare feature

**Rischio secondario:** utente non capisce valore
→ soluzione: dashboard immediata

---

## 13. North Star Metric

> L’utente controlla Domus prima di pagare una bolletta.

---

Se vuoi, nel prossimo step ti preparo anche la **User Story Map** (serve tantissimo quando inizierete a scrivere codice: evita il caos totale).
