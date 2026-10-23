@extends('layouts.app')

@section('title', 'Méthodes de paiement et recharge | TutinGo')
@section('meta_description', "Rechargez votre solde TutinGo en espèces, par carte bancaire (Payzone) ou avec PayPal. Paiement simple et sécurisé pour les élèves, les parents et les professeurs.")

@push('head')
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quels moyens de paiement sont acceptés sur TutinGo ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Vous pouvez recharger votre solde en espèces, par carte bancaire via Payzone (CMI, Visa, Mastercard) ou avec PayPal. Vous pouvez aussi payer votre professeur directement en espèces s'il accepte ce mode de paiement." }
    },
    {
      "@type": "Question",
      "name": "Puis-je payer mon professeur directement en espèces ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui, si votre professeur accepte ce mode de paiement. Il confirme la réception dans TutinGo et votre cours est marqué comme payé." }
    },
    {
      "@type": "Question",
      "name": "En combien de temps mon solde est-il crédité ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Immédiatement pour un paiement par carte bancaire ou PayPal. Pour un paiement en espèces, le solde est crédité dès que votre paiement a été vérifié par notre équipe." }
    },
    {
      "@type": "Question",
      "name": "Mes informations bancaires sont-elles enregistrées par TutinGo ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Non. Le paiement par carte se fait sur la page sécurisée de Payzone, et le paiement PayPal sur le site de PayPal. TutinGo ne voit ni ne conserve vos données de carte." }
    },
    {
      "@type": "Question",
      "name": "Mon solde expire-t-il ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Non, votre solde reste disponible sur votre compte et peut être utilisé pour tous vos prochains cours." }
    }
  ]
}
</script>
@endpush

@section('content')
<div class="bg-white">

    {{-- En-tête --}}
    <section class="bg-gradient-to-b from-indigo-50 to-white">
        <div class="max-w-5xl mx-auto px-4 py-16 text-center">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900">Méthodes de paiement et recharge</h1>
            <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Sur TutinGo, vous payez vos cours avec votre <strong>solde</strong>. Rechargez-le en quelques clics,
                avec le moyen de paiement qui vous convient.
            </p>
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                @auth
                    <a href="{{ url('/compte/recharge') }}" class="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Recharger mon solde</a>
                @else
                    <a href="{{ route('register') }}" class="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Créer mon compte</a>
                    <a href="{{ route('login') }}" class="inline-block rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">Se connecter</a>
                @endauth
            </div>
        </div>
    </section>

    {{-- Comment ça marche --}}
    <section class="max-w-5xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-900 text-center">Comment ça marche ?</h2>
        <ol class="mt-8 grid gap-6 md:grid-cols-3">
            <li class="rounded-xl border border-gray-200 p-6">
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">1</span>
                <h3 class="mt-4 font-semibold text-gray-900">Choisissez un montant</h3>
                <p class="mt-2 text-gray-600">Sélectionnez un pack ou saisissez le montant de votre choix, depuis votre espace « Mon portefeuille ».</p>
            </li>
            <li class="rounded-xl border border-gray-200 p-6">
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">2</span>
                <h3 class="mt-4 font-semibold text-gray-900">Choisissez votre mode de paiement</h3>
                <p class="mt-2 text-gray-600">Espèces, carte bancaire ou PayPal : le récapitulatif vous indique le montant exact avant de payer.</p>
            </li>
            <li class="rounded-xl border border-gray-200 p-6">
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">3</span>
                <h3 class="mt-4 font-semibold text-gray-900">Réservez vos cours</h3>
                <p class="mt-2 text-gray-600">Une fois votre solde crédité, réservez vos séances : le prix du cours est déduit automatiquement.</p>
            </li>
        </ol>
    </section>

    {{-- Les modes de paiement --}}
    <section class="bg-gray-50">
        <div class="max-w-5xl mx-auto px-4 py-12">
            <h2 class="text-2xl font-bold text-gray-900 text-center">Nos modes de paiement</h2>
            <div class="mt-8 grid gap-6 md:grid-cols-3">

                <article class="rounded-xl bg-white p-6 shadow-sm">
                    <div class="text-4xl" aria-hidden="true">💳</div>
                    <h3 class="mt-4 text-lg font-semibold text-gray-900">Carte bancaire — Payzone</h3>
                    <p class="mt-1 text-sm text-gray-500">CMI · Visa · Mastercard</p>
                    <ul class="mt-4 space-y-2 text-gray-600">
                        <li>✔ Paiement en dirhams (MAD)</li>
                        <li>✔ Solde crédité <strong>immédiatement</strong></li>
                        <li>✔ Page de paiement sécurisée Payzone avec 3-D Secure</li>
                    </ul>
                    <p class="mt-4 text-sm text-gray-500">Idéal pour les cartes bancaires marocaines.</p>
                </article>

                <article class="rounded-xl bg-white p-6 shadow-sm">
                    <div class="text-4xl" aria-hidden="true">🅿️</div>
                    <h3 class="mt-4 text-lg font-semibold text-gray-900">PayPal</h3>
                    <p class="mt-1 text-sm text-gray-500">Compte PayPal ou carte internationale</p>
                    <ul class="mt-4 space-y-2 text-gray-600">
                        <li>✔ Solde crédité <strong>immédiatement</strong></li>
                        <li>✔ Paiement en euros : le montant exact vous est affiché avant validation</li>
                        <li>✔ Votre solde est toujours crédité en dirhams</li>
                    </ul>
                    <p class="mt-4 text-sm text-gray-500">Idéal pour les familles à l'étranger.</p>
                </article>

                <article class="rounded-xl bg-white p-6 shadow-sm">
                    <div class="text-4xl" aria-hidden="true">💵</div>
                    <h3 class="mt-4 text-lg font-semibold text-gray-900">Espèces</h3>
                    <p class="mt-1 text-sm text-gray-500">Sans carte bancaire</p>
                    <p class="mt-4 font-medium text-gray-900">Option 1 — Recharge en espèces</p>
                    <ul class="mt-2 space-y-2 text-gray-600">
                        <li>✔ Vous recevez une <strong>référence de paiement</strong> par e-mail et SMS</li>
                        <li>✔ Vous payez en espèces dans un point de paiement indiqué, en donnant la référence</li>
                        <li>✔ Votre solde est crédité dès que votre paiement est vérifié</li>
                    </ul>
                    <p class="mt-4 font-medium text-gray-900">Option 2 — Espèces remises au professeur</p>
                    <ul class="mt-2 space-y-2 text-gray-600">
                        <li>✔ Uniquement si votre professeur accepte ce mode de paiement</li>
                        <li>✔ Le professeur confirme la réception du paiement dans TutinGo</li>
                        <li>✔ Votre cours est alors marqué comme payé</li>
                    </ul>
                </article>

            </div>
        </div>
    </section>

    {{-- Élèves / parents et professeurs --}}
    <section class="max-w-5xl mx-auto px-4 py-12">
        <div class="grid gap-6 md:grid-cols-2">
            <div class="rounded-xl border border-gray-200 p-6">
                <h2 class="text-xl font-bold text-gray-900">👨‍👩‍👧 Élèves et parents</h2>
                <ul class="mt-4 space-y-2 text-gray-600">
                    <li>• Rechargez votre solde avant de réserver, ou directement au moment de la réservation si votre solde est insuffisant.</li>
                    <li>• Votre solde n'expire pas : utilisez-le pour tous vos prochains cours.</li>
                    <li>• Si vous payez votre professeur directement en espèces, vérifiez qu'il a bien confirmé la réception dans TutinGo : c'est votre preuve de paiement.</li>
                    <li>• Retrouvez l'historique de vos recharges et téléchargez vos reçus dans « Mon portefeuille ».</li>
                </ul>
            </div>
            <div class="rounded-xl border border-gray-200 p-6">
                <h2 class="text-xl font-bold text-gray-900">👩‍🏫 Professeurs</h2>
                <ul class="mt-4 space-y-2 text-gray-600">
                    <li>• <strong>Paiement via TutinGo</strong> (carte, PayPal, recharge en espèces) : vos cours sont payés par la plateforme et vos gains apparaissent dans votre espace professeur.</li>
                    <li>• <strong>Espèces reçues directement</strong> : si vous acceptez ce mode, vous encaissez vous-même le paiement de l'élève. Une fois que vous avez confirmé la réception dans TutinGo, vous en êtes responsable.</li>
                    <li>• Pour ces cours payés en direct, la commission TutinGo est déduite de votre compte professeur. Si votre solde ne suffit pas, le montant reste dû jusqu'à votre prochaine recharge.</li>
                    <li>• Ne confirmez une réception d'espèces qu'après avoir réellement reçu l'argent.</li>
                    <li>• Pour toute question sur vos gains ou votre commission, contactez notre équipe depuis votre espace.</li>
                </ul>
            </div>
        </div>
    </section>

    {{-- Sécurité --}}
    <section class="bg-indigo-50">
        <div class="max-w-5xl mx-auto px-4 py-12">
            <h2 class="text-2xl font-bold text-gray-900 text-center">🔒 Des paiements sécurisés</h2>
            <div class="mt-8 grid gap-6 md:grid-cols-3 text-center">
                <div>
                    <h3 class="font-semibold text-gray-900">Aucune donnée de carte chez TutinGo</h3>
                    <p class="mt-2 text-gray-600">Vos paiements se font sur les pages sécurisées de Payzone ou de PayPal.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900">Connexion chiffrée</h3>
                    <p class="mt-2 text-gray-600">Toutes les pages TutinGo sont protégées par HTTPS.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900">Un reçu à chaque recharge</h3>
                    <p class="mt-2 text-gray-600">Vous êtes notifié par e-mail et pouvez télécharger votre reçu.</p>
                </div>
            </div>
            <p class="mt-8 text-center text-sm text-gray-600">
                ⚠️ TutinGo ne vous demandera jamais votre code de carte, votre mot de passe ou un paiement en dehors de la plateforme.
            </p>
        </div>
    </section>

    {{-- FAQ --}}
    <section class="max-w-3xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-900 text-center">Questions fréquentes</h2>
        <div class="mt-8 space-y-4">
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Quels moyens de paiement sont acceptés ?</summary>
                <p class="mt-2 text-gray-600">Les espèces, la carte bancaire via Payzone (CMI, Visa, Mastercard) et PayPal. Vous pouvez aussi payer votre professeur directement en espèces s'il accepte ce mode de paiement.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">En combien de temps mon solde est-il crédité ?</summary>
                <p class="mt-2 text-gray-600">Immédiatement par carte bancaire ou PayPal. En espèces, dès que votre paiement a été vérifié par notre équipe.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Y a-t-il un montant minimum de recharge ?</summary>
                <p class="mt-2 text-gray-600">Oui, les montants minimum et maximum sont indiqués sur la page de recharge, au moment de choisir votre montant.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">J'ai payé mais mon solde n'est pas crédité, que faire ?</summary>
                <p class="mt-2 text-gray-600">Vérifiez l'état de votre recharge dans « Mon portefeuille ». Si le problème persiste, contactez-nous en indiquant votre référence de transaction.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Mon paiement en espèces a dépassé la date limite, est-ce grave ?</summary>
                <p class="mt-2 text-gray-600">La référence n'est plus valable : créez simplement une nouvelle demande de recharge.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Puis-je payer mon professeur directement en espèces ?</summary>
                <p class="mt-2 text-gray-600">Oui, si votre professeur accepte ce mode de paiement. Il confirme la réception dans TutinGo et votre cours est marqué comme payé. Ne payez jamais un cours en espèces sans cette confirmation.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Je suis professeur : comment fonctionne la commission sur les cours payés en espèces ?</summary>
                <p class="mt-2 text-gray-600">Quand vous confirmez un paiement en espèces reçu directement, la commission TutinGo est déduite de votre compte professeur. Si votre solde est insuffisant, elle reste due et est déduite lors de votre prochaine recharge.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Puis-je être remboursé ?</summary>
                <p class="mt-2 text-gray-600">Les conditions de remboursement sont détaillées dans nos <a href="{{ url('/cgv') }}" class="text-indigo-600 underline">conditions générales de vente</a>.</p>
            </details>
        </div>
    </section>

    {{-- Appel à l'action --}}
    <section class="max-w-5xl mx-auto px-4 pb-16 text-center">
        <p class="text-gray-600">Une question sur un paiement ?</p>
        <a href="{{ url('/contact') }}" class="mt-3 inline-block rounded-lg border border-indigo-600 px-6 py-3 font-semibold text-indigo-600 hover:bg-indigo-50">Contacter le support</a>
    </section>

</div>
@endsection
