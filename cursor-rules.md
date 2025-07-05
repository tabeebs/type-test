## Cursor Rules (Style Guide & Linter)

1. **Code formatting**  
   - Always run `prettier --write` on all `.js/.ts` files.  
   - Enforce ESLint with the Airbnb config:  
     ```bash
     eslint --config .eslintrc-airbnb.json --fix
     ```  
2. **Naming conventions**  
   - React components: PascalCase (e.g. `MyComponent`).  
   - Functions/variables: camelCase.  
   - Files: kebab-case (e.g. `collision-engine.js`).  
3. **Commenting**  
   - JSDoc for all exported functions.  
   - Inline `// TODO:` only for genuinely pending work.  
4. **Testing**  
   - Use Jest for frontend, pytest for backend.  
   - All new code must have ≥80% coverage.  

---

## Automated Test‑Driven Workflow

For *every* implementation task (i.e. each checkbox in Phase 1):

1. **Generate or modify code** to satisfy the task.
2. **Run your test suite**:  
   - **Backend**:  
     ```bash
     cd backend && pytest --maxfail=1 --disable-warnings -q
     ```  
   - **Frontend**:  
     ```bash
     cd frontend && npm test -- --watchAll=false
     ```  
3. **If any tests fail**, stop, read the failure messages, fix the code, and re‑run the tests.  
4. **Only when all tests pass**, tick off the checkbox and move to the next one.

---