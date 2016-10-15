//	test.js first parameter is name of test, second is a function that executes tests that run within it.
//it() first parameter is the name of the spec, second parameter is fucntion that executes
describe('This test', function() {
	it('should always return true', function() {
		expect(true).toBe(true);
	});
})



describe('Add',	function() {
	it('should add two numbers together',
	function ()	{
		
		expect(add(1,2)).toBe(3);

	})
});