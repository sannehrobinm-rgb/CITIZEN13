export default function ZoneSelector({ onSelect }) {
return (
<div className="card">
<h3>Zone visitée</h3>
<input placeholder="Arrondissement" />
<input placeholder="Quartier" />
<input placeholder="Immeuble" />
<input placeholder="Étage" />
<input placeholder="Appartement" />
<button onClick={onSelect}>Valider zone</button>
</div>
)
}