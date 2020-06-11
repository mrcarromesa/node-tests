function soma(a, b) {
  return a + b;
}

// na descricao colocamos o que esperamos que o test retorne basicamente
test('if i call soma function with 4 and 5 it shoud return 9', () => {
  const result = soma(5, 4);

  expect(result).toBe(9);
});
