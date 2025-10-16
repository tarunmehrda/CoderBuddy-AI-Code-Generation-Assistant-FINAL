# -------------------------------------------------------
# 🚀 Complete Correct Agent Script
# -------------------------------------------------------

import sys
import os
from dotenv import load_dotenv
from langchain.globals import set_verbose, set_debug
from langchain_groq import ChatGroq
from langgraph.constants import END
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent

# Add the parent directory to sys.path to enable absolute imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ✅ Local imports (changed from relative to absolute)
from AGENT.prompt import *
from AGENT.states import Plan, TaskPlan, CoderState
from AGENT.tools import write_file, read_file, get_current_directory, list_files

# Load environment variables
load_dotenv()

# Enable detailed logging
set_debug(True)
set_verbose(True)

# Initialize the Groq LLM
llm = ChatGroq(model="openai/gpt-oss-120b")

# -------------------------------------------------------
# 🧠 AGENT 1: PLANNER
# -------------------------------------------------------
def planner_agent(state: dict) -> dict:
    """Converts user prompt into a structured high-level Plan."""
    user_prompt = state["user_prompt"]
    formatted_prompt = planner_prompt(user_prompt)
    resp = llm.with_structured_output(Plan).invoke(formatted_prompt)

    if resp is None:
        raise ValueError("❌ Planner did not return a valid response.")

    print("✅ Planner Output:\n", resp.model_dump_json(indent=2))
    return {"plan": resp}


# -------------------------------------------------------
# 🧩 AGENT 2: ARCHITECT
# -------------------------------------------------------
def architect_agent(state: dict) -> dict:
    """Creates detailed TaskPlan (implementation steps) from Plan."""
    plan: Plan = state["plan"]

    formatted_prompt = architect_prompt(plan=plan.model_dump_json())
    resp = llm.with_structured_output(TaskPlan).invoke(formatted_prompt)

    if resp is None:
        raise ValueError("❌ Architect did not return a valid response.")

    resp.plan = plan  # Keep original plan reference
    print("✅ Architect Output:\n", resp.model_dump_json(indent=2))
    return {"task_plan": resp}


# -------------------------------------------------------
# 🧰 AGENT 3: CODER
# -------------------------------------------------------
def coder_agent(state: dict) -> dict:
    """Executes coding tasks sequentially using LangGraph tools."""
    coder_state: CoderState = state.get("coder_state")

    # First run
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)

    steps = coder_state.task_plan.implementation_steps

    # Stop if done
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}

    # Get current implementation step
    current_task = steps[coder_state.current_step_idx]
    print(f"\n🧩 Working on Step {coder_state.current_step_idx + 1}/{len(steps)}:")
    print(f"📄 File: {current_task.filepath}")
    print(f"📝 Task: {current_task.task_description}\n")

    # Read existing file content
    existing_content = read_file.run(current_task.filepath)

    # Prepare prompt for coding agent
    system_prompt = coder_system_prompt()
    
    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.filepath}\n"
        f"Existing content:\n{existing_content}\n\n"
        "Use the available tools to read and write files. ONLY use the tools listed in the system prompt."
    )

    # Register available tools
    coder_tools = [
        write_file,
        read_file,
        list_files,
        get_current_directory
    ]

    # Create ReAct-style agent
    react_agent = create_react_agent(llm, coder_tools)

    # Execute one step
    react_agent.invoke({
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    })

    # Move to next step
    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}


# -------------------------------------------------------
# ⚙️ BUILD THE LANGGRAPH PIPELINE
# -------------------------------------------------------
graph = StateGraph(dict)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")

graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"},
)

graph.set_entry_point("planner")

# Compile to runnable graph
agent = graph.compile()

# -------------------------------------------------------
# 🚀 MAIN EXECUTION
# -------------------------------------------------------
if __name__ == "__main__":
    result = agent.invoke(
        {"user_prompt": "Create a simple and responsive Calculator  App using only HTML, CSS simple make fast."},
        
    )

    print("\n✅ Final State:")
    print(result)