# Using llnode (lldb)

//TODO, raw notes from deep dive:

1. Grab Core Dump and load it to llnode
2. Run v8 findjsobjects
   - This gives a list of object types with size + count
   - If a class Foo, you can use findrefs
3. -> if you can’t find the cause, see memory related user journeys to identify exact cause
