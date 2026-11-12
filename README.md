# Competence Assessment Tool

> **Status:** In Progress (Initial Architecture & DB Setup Completed)  
> *Progetto di Applicazioni Web Full Stack — Università degli Studi di Brescia*

Un'applicazione web full-stack progettata per la gestione, la somministrazione e la valutazione strutturata di matrici di competenze. Il sistema permette di gestire ruoli multipli (Amministratori, Test Designer, Valutatori e Utenti Valutati), calcolare automaticamente punteggi ponderati basati su *rubric levels* e tracciare l'esecuzione di test e relativi output digitali.

---

## Architettura del Progetto

Il progetto è impostato come un monorepo scalabile gestito tramite **Nx**, separando chiaramente il codice sorgente applicativo dalla documentazione tecnica e di analisi.

```text
ProgettoCompetenze/
├── docs/                      # Documentazione, Schema ER e file di esempio
│   ├── schema-er.png          # Visualizzazione grafica dello schema ER
│   ├── schema-er.pgerd        # File sorgente del database design
│   ├── matrice-competenze.xlsx# Matrice di competenze di riferimento (Excel)
│   └── consegna-progetto.pdf  # Specifiche ufficiali del cliente/corso
├── competence-project/        # Core application (TypeScript, React, Node.js, PostgreSQL)
│   ├── .env.example           # Template delle variabili d'ambiente
│   ├── .gitignore
│   ├── apps/                  # Codice sorgente (Backend & Frontend)
|   └── libs/                  # Librerie utilizzate nel codice sorgente
└── README.md