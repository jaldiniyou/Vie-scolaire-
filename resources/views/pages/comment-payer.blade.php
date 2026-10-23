@extends('layouts.app')

@section('title', 'Comment payer sur TutinGo ? Élèves, parents et professeurs | TutinGo')
@section('meta_description', "Découvrez comment fonctionnent les paiements sur TutinGo selon votre profil : élève, parent ou professeur. Recharge du solde, espèces, carte bancaire Payzone, PayPal et commission.")

@push('head')
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment paie-t-on un cours sur TutinGo ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le cours est payé avec le solde du compte TutinGo, rechargé par carte bancaire (Payzone), PayPal ou en espèces. Il peut aussi être payé directement en espèces au professeur, si celui-ci accepte ce mode de paiement." }
    },
    {
      "@type": "Question",
      "name": "Un parent peut-il payer les cours de son enfant ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui. Le parent recharge le solde du compte et suit les cours et les paiements de son enfant depuis son espace." }
    },
    {
      "@type": "Question",
      "name": "Comment un professeur est-il payé ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Pour les cours payés via TutinGo, les gains du professeur apparaissent dans son espace. Pour les cours payés en espèces directement au professeur, la commission TutinGo est déduite de son compte professeur." }
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
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900">Comment payer sur TutinGo ?</h1>
            <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Élève, parent ou professeur : voici comment se passent les paiements des cours, étape par étape.
            </p>

            {{-- Choix du profil --}}
            <nav class="mt-8 flex flex-wrap justify-center gap-3" aria-label="Choisir votre profil">
                <a href="#eleve" data-role-tab="eleve" class="role-tab rounded-full border border-indigo-600 px-5 py-2 font-semibold text-indigo-600 hover:bg-indigo-50">🎒 Je suis élève</a>
                <a href="#parent" data-role-tab="parent" class="role-tab rounded-full border border-indigo-600 px-5 py-2 font-semibold text-indigo-600 hover:bg-indigo-50">👨‍👩‍👧 Je suis parent</a>
                <a href="#professeur" data-role-tab="professeur" class="role-tab rounded-full border border-indigo-600 px-5 py-2 font-semibold text-indigo-600 hover:bg-indigo-50">👩‍🏫 Je suis professeur</a>
            </nav>
        </div>
    </section>

    {{-- Le principe --}}
    <section class="max-w-5xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-900 text-center">Le principe en bref</h2>
        <div class="mt-8 grid gap-6 md:grid-cols-2">
            <div class="rounded-xl border border-gray-200 p-6">
                <h3 class="font-semibold text-gray-900">💳 Paiement via TutinGo</h3>
                <p class="mt-2 text-gray-600">
                    Le cours est payé avec le <strong>solde</strong> du compte. Le solde se recharge par carte bancaire (Payzone),
                    PayPal ou en espèces. Le prix du cours est déduit automatiquement à la réservation.
                </p>
            </div>
            <div class="rounded-xl border border-gray-200 p-6">
                <h3 class="font-semibold text-gray-900">💵 Espèces remises au professeur</h3>
                <p class="mt-2 text-gray-600">
                    Si le professeur l'accepte, le cours peut lui être payé directement en espèces.
                    Le professeur confirme la réception dans TutinGo et le cours est marqué comme payé.
                </p>
            </div>
        </div>
    </section>

    {{-- Modes de paiement --}}
    <section class="bg-gray-50">
        <div class="max-w-5xl mx-auto px-4 py-12">
            <h2 class="text-2xl font-bold text-gray-900 text-center">Les modes de paiement</h2>
            <div class="mt-8 overflow-x-auto">
                <table class="w-full min-w-[560px] rounded-xl bg-white text-left shadow-sm">
                    <thead class="border-b border-gray-200 text-sm text-gray-500">
                        <tr>
                            <th class="p-4">Mode</th>
                            <th class="p-4">Comment ?</th>
                            <th class="p-4">Quand est-ce validé ?</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-gray-700">
                        <tr>
                            <td class="p-4 font-semibold">💳 Carte bancaire (Payzone)</td>
                            <td class="p-4">Recharge du solde en dirhams, par carte CMI, Visa ou Mastercard</td>
                            <td class="p-4">Immédiatement</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-semibold">🅿️ PayPal</td>
                            <td class="p-4">Recharge du solde en euros ; le solde est crédité en dirhams</td>
                            <td class="p-4">Immédiatement</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-semibold">💵 Recharge en espèces</td>
                            <td class="p-4">Paiement dans un point indiqué, avec une référence reçue par e-mail et SMS</td>
                            <td class="p-4">Dès que le paiement est vérifié</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-semibold">🤝 Espèces au professeur</td>
                            <td class="p-4">Paiement remis en main propre, si le professeur l'accepte</td>
                            <td class="p-4">Dès que le professeur confirme la réception</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    {{-- Élève --}}
    <section id="eleve" data-role-panel="eleve" class="role-panel max-w-5xl mx-auto px-4 py-12 scroll-mt-20">
        <h2 class="text-2xl font-bold text-gray-900">🎒 Je suis élève</h2>
        <ol class="mt-6 space-y-4">
            <li class="rounded-xl border border-gray-200 p-5">
                <p class="font-semibold text-gray-900">1. Je choisis mon professeur et mon créneau</p>
                <p class="mt-1 text-gray-600">Le prix du cours est affiché avant la réservation.</p>
            </li>
            <li class="rounded-xl border border-gray-200 p-5">
                <p class="font-semibold text-gray-900">2. Je choisis comment payer</p>
                <p class="mt-1 text-gray-600">
                    Avec mon solde TutinGo (rechargé par carte, PayPal ou en espèces), ou en espèces directement au professeur
                    s'il accepte ce mode de paiement. Si je suis mineur, c'est mon parent qui gère la recharge du solde.
                </p>
            </li>
            <li class="rounded-xl border border-gray-200 p-5">
                <p class="font-semibold text-gray-900">3. Je suis mon cours</p>
                <p class="mt-1 text-gray-600">Le paiement apparaît dans mon historique, avec un reçu à télécharger.</p>
            </li>
        </ol>
        <p class="mt-6 rounded-lg bg-amber-50 p-4 text-amber-800">
            💡 Si je paie mon professeur en espèces, je vérifie qu'il a confirmé la réception dans TutinGo : c'est ma preuve de paiement.
        </p>
    </section>

    {{-- Parent --}}
    <section id="parent" data-role-panel="parent" class="role-panel bg-gray-50 scroll-mt-20">
        <div class="max-w-5xl mx-auto px-4 py-12">
            <h2 class="text-2xl font-bold text-gray-900">👨‍👩‍👧 Je suis parent</h2>
            <ol class="mt-6 space-y-4">
                <li class="rounded-xl bg-white p-5 shadow-sm">
                    <p class="font-semibold text-gray-900">1. Je crée mon compte et j'ajoute mon ou mes enfants</p>
                    <p class="mt-1 text-gray-600">Je gère tous les cours de la famille depuis un seul espace.</p>
                </li>
                <li class="rounded-xl bg-white p-5 shadow-sm">
                    <p class="font-semibold text-gray-900">2. Je recharge le solde</p>
                    <p class="mt-1 text-gray-600">
                        Par carte bancaire (Payzone), PayPal ou en espèces. Le montant exact est affiché avant chaque paiement.
                        Le solde n'expire pas.
                    </p>
                </li>
                <li class="rounded-xl bg-white p-5 shadow-sm">
                    <p class="font-semibold text-gray-900">3. Les cours sont payés automatiquement</p>
                    <p class="mt-1 text-gray-600">Le prix de chaque cours réservé est déduit du solde. Je peux aussi payer le professeur en espèces s'il l'accepte.</p>
                </li>
                <li class="rounded-xl bg-white p-5 shadow-sm">
                    <p class="font-semibold text-gray-900">4. Je suis tout en temps réel</p>
                    <p class="mt-1 text-gray-600">Historique des recharges et des cours, reçus téléchargeables, notifications à chaque paiement.</p>
                </li>
            </ol>
            <p class="mt-6 rounded-lg bg-amber-50 p-4 text-amber-800">
                💡 Vous vivez à l'étranger ? PayPal est la solution la plus simple pour payer les cours de votre enfant au Maroc.
            </p>
        </div>
    </section>

    {{-- Professeur --}}
    <section id="professeur" data-role-panel="professeur" class="role-panel max-w-5xl mx-auto px-4 py-12 scroll-mt-20">
        <h2 class="text-2xl font-bold text-gray-900">👩‍🏫 Je suis professeur</h2>

        <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div class="rounded-xl border border-gray-200 p-6">
                <h3 class="font-semibold text-gray-900">💳 Cours payés via TutinGo</h3>
                <ul class="mt-3 space-y-2 text-gray-600">
                    <li>• L'élève ou le parent paie avec son solde TutinGo.</li>
                    <li>• Vous n'avez aucun argent à gérer.</li>
                    <li>• Vos gains apparaissent dans votre espace professeur après chaque cours effectué.</li>
                </ul>
            </div>
            <div class="rounded-xl border border-gray-200 p-6">
                <h3 class="font-semibold text-gray-900">💵 Espèces reçues directement</h3>
                <ul class="mt-3 space-y-2 text-gray-600">
                    <li>• Vous choisissez d'accepter ou non ce mode de paiement dans votre profil.</li>
                    <li>• Vous encaissez vous-même le paiement de l'élève ou du parent.</li>
                    <li>• Vous confirmez la réception dans TutinGo : à partir de cette confirmation, <strong>vous êtes responsable</strong> de cet encaissement.</li>
                </ul>
            </div>
        </div>

        <div class="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-6">
            <h3 class="font-semibold text-gray-900">La commission sur les cours payés en espèces</h3>
            <ol class="mt-3 space-y-2 text-gray-700">
                <li>1. Après votre confirmation, la commission TutinGo est déduite de votre compte professeur.</li>
                <li>2. Si votre solde est insuffisant, la commission reste due.</li>
                <li>3. Elle est déduite automatiquement lors de votre prochaine recharge.</li>
            </ol>
            <p class="mt-3 text-sm text-gray-600">Le détail de vos commissions est visible à tout moment dans votre espace professeur.</p>
        </div>

        <p class="mt-6 rounded-lg bg-amber-50 p-4 text-amber-800">
            ⚠️ Ne confirmez une réception d'espèces qu'après avoir réellement reçu l'argent.
        </p>
    </section>

    {{-- Sécurité --}}
    <section class="bg-indigo-50">
        <div class="max-w-5xl mx-auto px-4 py-12 text-center">
            <h2 class="text-2xl font-bold text-gray-900">🔒 Des paiements sécurisés</h2>
            <p class="mt-4 text-gray-600 max-w-2xl mx-auto">
                Les paiements par carte se font sur la page sécurisée de Payzone et les paiements PayPal sur le site de PayPal :
                TutinGo ne voit ni ne conserve vos données de carte.
            </p>
            <p class="mt-4 text-sm text-gray-600">
                TutinGo ne vous demandera jamais votre code de carte ou votre mot de passe.
            </p>
        </div>
    </section>

    {{-- FAQ --}}
    <section class="max-w-3xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-900 text-center">Questions fréquentes</h2>
        <div class="mt-8 space-y-4">
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Comment paie-t-on un cours sur TutinGo ?</summary>
                <p class="mt-2 text-gray-600">Avec le solde du compte, rechargé par carte bancaire (Payzone), PayPal ou en espèces. Ou directement en espèces au professeur, s'il accepte ce mode de paiement.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Un parent peut-il payer les cours de son enfant ?</summary>
                <p class="mt-2 text-gray-600">Oui. Le parent recharge le solde et suit les cours et les paiements de son enfant depuis son espace.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Comment un professeur est-il payé ?</summary>
                <p class="mt-2 text-gray-600">Pour les cours payés via TutinGo, ses gains apparaissent dans son espace professeur. Pour les cours payés en espèces directement, il encaisse lui-même et la commission TutinGo est déduite de son compte.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">J'ai payé mais mon cours n'apparaît pas comme payé, que faire ?</summary>
                <p class="mt-2 text-gray-600">Vérifiez votre historique dans votre espace. Si vous avez payé en espèces au professeur, demandez-lui de confirmer la réception. Si le problème persiste, contactez-nous avec votre référence de transaction.</p>
            </details>
            <details class="rounded-lg border border-gray-200 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Puis-je être remboursé ?</summary>
                <p class="mt-2 text-gray-600">Les conditions de remboursement sont détaillées dans nos <a href="{{ url('/cgv') }}" class="text-indigo-600 underline">conditions générales de vente</a>.</p>
            </details>
        </div>
        <p class="mt-8 text-center text-gray-600">
            Plus de détails sur la recharge : <a href="{{ url('/methodes-de-paiement') }}" class="text-indigo-600 underline">méthodes de paiement et recharge</a>.
        </p>
    </section>

    {{-- Appel à l'action --}}
    <section class="max-w-5xl mx-auto px-4 pb-16 text-center">
        @guest
            <a href="{{ route('register') }}" class="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Créer mon compte</a>
        @endguest
        <a href="{{ url('/contact') }}" class="ml-2 mt-3 inline-block rounded-lg border border-indigo-600 px-6 py-3 font-semibold text-indigo-600 hover:bg-indigo-50">Contacter le support</a>
    </section>

</div>
@endsection

@push('scripts')
<script>
    // Met en évidence le profil choisi (la page reste lisible sans JavaScript)
    document.querySelectorAll('[data-role-tab]').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('[data-role-tab]').forEach(function (t) {
                t.classList.remove('bg-indigo-600', 'text-white');
            });
            tab.classList.add('bg-indigo-600', 'text-white');
        });
    });
</script>
@endpush
