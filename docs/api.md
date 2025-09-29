## Workflow Examples

### Creating a Complete Course Structure

1. **Create Course**
   ```http
   POST /admin/courses
   ```

2. **Add Chapter**
   ```http
   POST /admin/chapters
   ```

3. **Add Lesson**
   ```http
   POST /admin/lessons
   ```

4. **Add Words**
   ```http
   POST /admin/words
   ```

5. **Generate Audio**
   ```http
   POST /admin/words/{word_id}/generate-audio
   POST /admin/words/{word_id}/generate-example-audio
   ```

6. **Upload Images**
   ```http
   POST /admin/upload/image/{word_id}
   ```

### Adding Story Content

1. **Create Story**
   ```http
   POST /admin/stories
   ```

2. **Generate Story Audio**
   ```http
   POST /admin/stories/{story_id}/generate-audio
   ```

This documentation covers all admin endpoints with request/response examples and error handling. Use this as a reference when integrating with the admin API.