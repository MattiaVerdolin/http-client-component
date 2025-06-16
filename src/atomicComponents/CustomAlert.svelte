<script>
    import ButtonModel from "./ButtonModel.svelte";
    import "../style/CustomAlertStyle.css"

    export let message = "";
    export let title = "Alert";
    export let onClose = () => {};
    export let alertClass = "";
</script>

<div class="overlay">
    <div class = {alertClass}>
        <h2>{title}</h2>
        <p>{message}</p>
        <ButtonModel buttonText="Chiudi" onClick="{onClose}"/>
    </div>
</div>

<style>
    @import "../style/CustomAlertStyle.css";
</style>

