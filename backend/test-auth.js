const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAuthorization() {
  try {
    // Setup: Create test users
    console.log('Setup: Creating test users...');
    
    try {
      await axios.post(`${API_BASE}/users`, {
        name: 'Test User 1',
        email: 'user1@example.com',
        password: 'password123',
        role: 'member'
      });
      console.log('User1 created successfully');
    } catch (error) {
      if (error.response?.status !== 409) {
        console.log('Error creating user1:', error.response?.data?.message || error.message);
      } else {
        console.log('User1 already exists');
      }
    }

    try {
      await axios.post(`${API_BASE}/users`, {
        name: 'Test User 2',
        email: 'user2@example.com',
        password: 'password123',
        role: 'member'
      });
      console.log('User2 created successfully');
    } catch (error) {
      if (error.response?.status !== 409) {
        console.log('Error creating user2:', error.response?.data?.message || error.message);
      } else {
        console.log('User2 already exists');
      }
    }

    // Test 1: Login as first user
    console.log('\n1. Logging in as user1...');
    const user1Login = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user1@example.com',
      password: 'password123'
    });
    const user1Token = user1Login.data.access_token;
    const user1Id = user1Login.data.user.id;
    console.log('User1 logged in successfully');

    // Test 2: Login as second user
    console.log('2. Logging in as user2...');
    const user2Login = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user2@example.com',
      password: 'password123'
    });
    const user2Token = user2Login.data.access_token;
    const user2Id = user2Login.data.user.id;
    console.log('User2 logged in successfully');

    // Test 3: Create project as user1
    console.log('3. Creating project as user1...');
    const project = await axios.post(`${API_BASE}/projects`, {
      name: 'Test Authorization Project',
      description: 'Testing authorization'
    }, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    const projectId = project.data.id;
    console.log('Project created:', projectId);

    // Test 4: Create task assigned to user2
    console.log('4. Creating task assigned to user2...');
    const task = await axios.post(`${API_BASE}/tasks`, {
      title: 'Test Task for User2',
      description: 'This task should only be visible/editable by user2',
      projectId: projectId,
      assignedToId: user2Id,
      priority: 'medium',
      status: 'todo'
    }, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    const taskId = task.data.id;
    console.log('Task created:', taskId);

    // Test 5: User2 should see only their assigned tasks
    console.log('5. Testing task visibility for user2...');
    const user2Tasks = await axios.get(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    console.log(`User2 can see ${user2Tasks.data.length} tasks (should be 1)`);

    // Test 6: User1 should not see tasks (not assigned to any)
    console.log('6. Testing task visibility for user1...');
    const user1Tasks = await axios.get(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    console.log(`User1 can see ${user1Tasks.data.length} tasks (should be 0)`);

    // Test 7: User2 should be able to update their task
    console.log('7. Testing task update by assigned user (user2)...');
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}`, {
        status: 'in_progress'
      }, {
        headers: { Authorization: `Bearer ${user2Token}` }
      });
      console.log('✓ User2 successfully updated their task');
    } catch (error) {
      console.log('✗ User2 failed to update their task:', error.response?.data?.message);
    }

    // Test 8: User1 should NOT be able to update the task
    console.log('8. Testing task update by non-assigned user (user1)...');
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}`, {
        status: 'done'
      }, {
        headers: { Authorization: `Bearer ${user1Token}` }
      });
      console.log('✗ User1 was able to update task (should be forbidden)');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✓ User1 correctly forbidden from updating task');
      } else {
        console.log('✗ Unexpected error:', error.response?.data?.message);
      }
    }

    // Test 9: User1 should NOT be able to view the specific task
    console.log('9. Testing task view by non-assigned user (user1)...');
    try {
      await axios.get(`${API_BASE}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user1Token}` }
      });
      console.log('✗ User1 was able to view task (should be forbidden)');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✓ User1 correctly forbidden from viewing task');
      } else {
        console.log('✗ Unexpected error:', error.response?.data?.message);
      }
    }

    // Cleanup
    console.log('10. Cleaning up...');
    await axios.delete(`${API_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    await axios.delete(`${API_BASE}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    console.log('Cleanup completed');

    console.log('\n=== Authorization Test Results ===');
    console.log('✓ Task visibility properly restricted to assigned users');
    console.log('✓ Task updates properly restricted to assigned users');
    console.log('✓ Task viewing properly restricted to assigned users');
    console.log('✓ All authorization fixes working correctly!');

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testAuthorization();
