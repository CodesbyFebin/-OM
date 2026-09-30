.PHONY: install test selftest offline
install:  ; pip install -e .
test:     ; python -m unittest discover -s tests -t .
selftest: ; dh-research selftest
offline:  ; dh-research repo --repo awesome-agent-skills --offline
