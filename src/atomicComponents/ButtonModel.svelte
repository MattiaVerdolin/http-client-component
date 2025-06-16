<script>
  export let buttonText = "buttonName"
  export let onClick = () => {};

</script>

<button on:click={onClick}>
  <slot name="icon" />
  {buttonText}
</button>

<style>
  button:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  /* Pulsante + rotondo con ombreggiatura */
  button {
    background-color: #007BFF;
    color: #fff;
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: background-color 0.2s, transform 0.2s;
    gap: 6px;
  }

  /* Animazione fadeIn */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
</style>
