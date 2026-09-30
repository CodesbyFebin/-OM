#!/usr/bin/env python3
"""Test suite for recipe generator."""

import unittest
from dh_research.recipe_generator import (
    Recipe,
    extract_patterns,
    generate_bash_recipe,
    generate_docker_recipe,
    generate_test_recipe,
    render_recipe,
    render_recipe_index,
)


class TestRecipeGenerator(unittest.TestCase):
    """Recipe generation tests."""

    def test_extract_patterns_bash(self):
        """Extract bash code blocks from README."""
        readme = """
# Install

```bash
pip install anthropic
```

# Usage

```python
import anthropic
```
"""
        patterns = extract_patterns(readme)
        self.assertGreaterEqual(len(patterns), 2)
        self.assertTrue(any("pip" in str(p) for p in patterns))

    def test_extract_patterns_empty(self):
        """Handle empty README."""
        patterns = extract_patterns("")
        self.assertEqual(patterns, [])

    def test_generate_bash_recipe(self):
        """Generate a bash installation recipe."""
        project = {
            "name": "Test Project",
            "description": "A test project",
            "canonical_url": "https://github.com/test/project",
            "license": "MIT"
        }

        recipe = generate_bash_recipe(project, "pip install test-project")

        self.assertEqual(recipe.type, "bash")
        self.assertIn("pip install", recipe.content)
        self.assertIn("install-", recipe.name)
        self.assertEqual(recipe.difficulty, "beginner")

    def test_generate_docker_recipe_python(self):
        """Generate Docker recipe for Python project."""
        project = {
            "name": "Python App",
            "primary_language": "python"
        }

        recipe = generate_docker_recipe(project)

        self.assertEqual(recipe.type, "dockerfile")
        self.assertIn("python:3.10", recipe.content)
        self.assertIn("pip install", recipe.content)

    def test_generate_docker_recipe_node(self):
        """Generate Docker recipe for Node project."""
        project = {
            "name": "Node App",
            "primary_language": "javascript"
        }

        recipe = generate_docker_recipe(project)

        self.assertEqual(recipe.type, "dockerfile")
        self.assertIn("node:", recipe.content)
        self.assertIn("npm", recipe.content)

    def test_generate_test_recipe(self):
        """Generate test template recipe."""
        project = {
            "name": "Test Project",
            "primary_language": "python"
        }

        recipe = generate_test_recipe(project)

        self.assertEqual(recipe.type, "python")
        self.assertIn("def test_", recipe.content)
        self.assertTrue("pytest" in recipe.requirements)

    def test_render_recipe(self):
        """Render a recipe to markdown."""
        recipe = Recipe(
            name="test-recipe",
            description="A test recipe",
            type="bash",
            tags=["test"],
            content="echo 'hello'",
            requirements=["bash"]
        )

        rendered = render_recipe(recipe)

        self.assertIn("# test-recipe", rendered)
        self.assertIn("A test recipe", rendered)
        self.assertIn("```bash", rendered)
        self.assertIn("echo 'hello'", rendered)
        self.assertIn("bash", rendered)

    def test_render_recipe_index(self):
        """Render an index of recipes."""
        recipes = [
            Recipe(
                name="recipe-1",
                description="Recipe 1",
                type="bash",
                tags=["test"],
                content="echo 1"
            ),
            Recipe(
                name="recipe-2",
                description="Recipe 2",
                type="python",
                tags=["test"],
                content="print(2)"
            ),
        ]

        index = render_recipe_index(recipes)

        self.assertIn("# Recipe Index", index)
        self.assertIn("BASH", index)
        self.assertIn("PYTHON", index)
        self.assertIn("recipe-1", index)
        self.assertIn("recipe-2", index)


if __name__ == "__main__":
    unittest.main()
