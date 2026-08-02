# US Nous Design System

## But de marque

US est une application premium de rencontres universitaires pour etudiants majeurs. L'interface doit transmettre confiance, securite, authenticite, emotion et modernite, sans ressembler a une plateforme nocturne ou explicite.

## Tokens Visuels

- Rouge prestige: `#D7263D`, actions principales et emotion.
- Rose elegant: `#EC4899`, accent relationnel.
- Violet royal: `#6C2BD9`, technologie et premium.
- Or premium: `#D4AF37`, badges verifies, plans Gold et elements rares.
- Fond sombre: `#0F0B16`, `#15101F`, `#24182F`.
- Texte secondaire sombre: `#B9B4C4`.
- Succes: `#22C55E`, erreur: `#DC2626`, warning: `#F59E0B`.

## Gradients

- Principal: `#D7263D -> #EC4899 -> #6C2BD9`.
- Premium: `#6C2BD9 -> #D4AF37`.
- Sombre premium: `#15101F -> #2B123F`.

## Typographie

- Titres, chiffres, boutons: Poppins en priorite, fallback Inter/system.
- Corps, labels, navigation: Inter en priorite, fallback system.
- Mobile-first: titres de page 28-34px, body 14-16px, captions 12-13px.

## Composants

- Boutons: primary gradient, secondary glass, premium, ghost, danger, disabled/loading.
- Formulaires: champs glass, select sombre, textarea, OTP, toggles, chips.
- Feedback: spinner, skeletons, empty states, notices, pages systeme.
- Badges: neutral, primary, success, danger, gold.
- Navigation: bottom nav mobile a 5 onglets: Decouvrir, Likes, Matchs, Messages, Profil. Notifications dans le header.

## Regles Produit

- Jamais de coordonnees GPS exactes.
- Jamais d'adresse personnelle exacte.
- Documents d'identite toujours presentes comme confidentiels.
- Signalement, blocage, aide et securite doivent rester accessibles.
- Tous les textes visibles sont en francais.
- Les modules sans endpoint backend affichent un etat vide ou prepare, pas de fausses donnees.

## Responsive

- Mobile: une decision par ecran, onglets inferieurs, cartes lisibles.
- Desktop: sidebar fixe, contenu central, panneau contextuel si utile.
- Les cartes restent entre 18 et 24px de radius selon le design Stitch.
