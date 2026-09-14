// @ts-check
import eslint from '@eslint/js'
import parserTypescriptEslint from '@typescript-eslint/parser'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: ['eslint.config.mjs']
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest
			},
			sourceType: 'module',
			parser: parserTypescriptEslint,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				ecmaFeatures: {
					jsx: true
				}
			}
		}
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/ban-types': 'off', // временно отключаем проверку типов для IntrinsicElements
			'prettier/prettier': ['error'], // разрешаем конфликты стилей между prettier и typescript
			'@typescript-eslint/prefer-exact-props': 'off', // выключаем точное соответствие свойств компонентов
			'@typescript-eslint/require-await': 'off'
		}
	}
)
