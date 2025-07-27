import { test, expect, describe } from 'vitest'
import { CommandHistory } from "../src/frontend/session/command-history"

describe('CommandHistory', () => {
  test('back() returns commands in reverse order', () => {
    const history = new CommandHistory()
    const commands = ["climb tower", "exp", "info"]
    commands.forEach(cmd => history.add(cmd))
    
    expect(history.back()).toBe("exp")
    expect(history.back()).toBe("climb tower")
    expect(history.back()).toBe("info")
  })
})