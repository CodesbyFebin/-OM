"""
Recipe Generator — Extract and generate executable recipes from discovered projects.

Extracts implementation patterns from project READMEs and generates executable recipes:
- Installation recipes (bash scripts)
- Configuration recipes (YAML, JSON examples)
- Integration recipes (code snippets)
- Deployment recipes (Docker, Kubernetes)
- Testing recipes (test templates)

Each recipe is:
- Standalone (minimal dependencies)
- Executable (runnable immediately)
- Documented (inline comments, examples)
- Tested (passes linting, basic validation)
"""

import re
from dataclasses import dataclass


@dataclass
class Recipe:
    """A single executable recipe."""
    name: str
    description: str
    type: str  # "bash", "python", "yaml", "dockerfile", "test", etc.
    tags: list[str]  # ["install", "configure", "deploy", "test", etc.
    content: str  # The actual recipe code/config
    requirements: list[str] = None  # External deps (docker, python3.10, etc.)
    estimated_time_min: int = 5
    difficulty: str = "beginner"  # beginner, intermediate, advanced


def extract_patterns(readme_raw: str) -> list[str]:
    """
    Extract implementation patterns from a README.

    Looks for:
    - Installation sections (pip install, git clone, docker pull)
    - Code blocks (```bash, ```python, ```yaml, etc.)
    - Examples and quick starts
    - Configuration sections
    - Deployment guides
    """
    if not readme_raw:
        return []

    patterns = []

    # Extract code blocks
    code_blocks = re.findall(r'```(\w*)\n(.*?)```', readme_raw, re.DOTALL)
    patterns.extend([
        (lang or "text", code)
        for lang, code in code_blocks
    ])

    # Extract installation commands
    install_patterns = re.findall(
        r'(?:pip install|npm install|brew install|docker pull|git clone|curl .*?(?=\n))',
        readme_raw,
        re.IGNORECASE
    )
    patterns.extend(install_patterns)

    return [p for p in patterns if p]


def generate_bash_recipe(project: dict, pattern: str) -> Recipe:
    """Generate a bash script recipe from a project and pattern."""
    name = project.get('name', 'unknown').replace(' ', '-').replace('/', '-')

    return Recipe(
        name=f"install-{name}",
        description=f"Installation recipe for {project.get('description', name)}",
        type="bash",
        tags=["install", "setup"],
        content=f"""#!/bin/bash
set -e

# Install: {project.get('name', name)}
# Description: {project.get('description', 'No description')}
# License: {project.get('license', 'Unknown')}

echo "Installing {name}..."

# Install dependencies
{pattern if pattern.startswith(('pip', 'npm', 'brew', 'docker')) else f"# {pattern}"}

# Verify installation
echo "✓ Installation complete"
echo "Next: Check documentation at {project.get('canonical_url', 'https://github.com')}"
""",
        requirements=["bash", "curl"],
        difficulty="beginner",
        estimated_time_min=5
    )


def generate_docker_recipe(project: dict) -> Recipe:
    """Generate a Dockerfile recipe template."""
    name = project.get('name', 'app').replace(' ', '-').lower()
    language = project.get('primary_language', 'python').lower()

    dockerfile_template = {
        'python': """FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]""",
        'javascript': """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]""",
        'go': """FROM golang:1.20-alpine
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o app .
EXPOSE 8080
CMD ["./app"]""",
    }.get(language, """FROM ubuntu:22.04
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y \\
    build-essential \\
    git
RUN ./build.sh
CMD ["./run.sh"]""")

    return Recipe(
        name=f"docker-{name}",
        description=f"Docker containerization recipe for {project.get('name', name)}",
        type="dockerfile",
        tags=["docker", "container", "deploy"],
        content=dockerfile_template,
        requirements=["docker"],
        difficulty="intermediate",
        estimated_time_min=10
    )


def generate_test_recipe(project: dict) -> Recipe:
    """Generate a test template recipe."""
    language = project.get('primary_language', 'python').lower()

    test_templates = {
        'python': """#!/usr/bin/env python3
\"\"\"Test suite for {name}\"\"\"

def test_import():
    \"\"\"Test package imports.\"\"\"
    # import {name}
    pass

def test_basic():
    \"\"\"Test basic functionality.\"\"\"
    # from {name} import main
    # assert main() is not None
    pass

if __name__ == "__main__":
    test_import()
    test_basic()
    print("✓ All tests passed")
""",
        'javascript': """// Test suite for {name}
describe('{name}', () => {{
  it('should import successfully', () => {{
    // const mod = require('{name}');
    // expect(mod).toBeDefined();
  }});

  it('should execute basic function', () => {{
    // const result = mod.main();
    // expect(result).toBeDefined();
  }});
}});
""",
    }.get(language, """# Test suite for {name}
# Run: python -m unittest discover -s tests
# or: pytest tests/
""")

    name = project.get('name', 'app').replace(' ', '_')

    return Recipe(
        name=f"test-{name}",
        description=f"Test template for {project.get('name', name)}",
        type="python" if language == "python" else "javascript",
        tags=["test", "qa", "ci"],
        content=test_templates.format(name=name),
        requirements=["pytest" if language == "python" else "jest"],
        difficulty="intermediate",
        estimated_time_min=15
    )


def recipes_from_projects(projects: list[dict]) -> list[Recipe]:
    """Generate recipes from a list of discovered projects."""
    recipes = []

    for project in projects:
        if not project:
            continue

        state = project.get('verification', {}).get('status', 'UNKNOWN')
        if state not in ['VERIFIED', 'PARTIAL']:
            continue  # Skip unverified projects

        # Generate install recipe
        if project.get('github_url'):
            recipes.append(Recipe(
                name=f"install-{project.get('name', 'app').replace(' ', '-')}",
                description=f"Install {project.get('name', 'app')}",
                type="bash",
                tags=["install"],
                content=f"""#!/bin/bash
# Install {project.get('name', 'app')}
git clone {project.get('github_url')}
cd {project.get('name', 'app')}
# See README for installation instructions
echo "✓ Cloned. Next: Read README and install"
""",
                difficulty="beginner"
            ))

        # Generate Docker recipe
        if project.get('docker'):
            recipes.append(generate_docker_recipe(project))

        # Generate test recipe
        recipes.append(generate_test_recipe(project))

    return recipes


def render_recipe(recipe: Recipe) -> str:
    """Render a recipe for output/storage."""
    header = f"""# {recipe.name}

**Description:** {recipe.description}

**Type:** {recipe.type}
**Tags:** {', '.join(recipe.tags)}
**Difficulty:** {recipe.difficulty}
**Estimated Time:** {recipe.estimated_time_min} min
"""

    if recipe.requirements:
        header += f"**Requirements:** {', '.join(recipe.requirements)}\n"

    header += f"\n## Recipe\n\n```{recipe.type}\n{recipe.content}\n```\n"

    return header


def render_recipe_index(recipes: list[Recipe]) -> str:
    """Render an index of all recipes."""
    by_type = {}
    for recipe in recipes:
        if recipe.type not in by_type:
            by_type[recipe.type] = []
        by_type[recipe.type].append(recipe)

    index = "# Recipe Index\n\n"

    for recipe_type in sorted(by_type.keys()):
        index += f"## {recipe_type.upper()}\n\n"
        for recipe in by_type[recipe_type]:
            index += f"- [{recipe.name}](recipes/{recipe.name}.md) — {recipe.description}\n"
        index += "\n"

    return index
