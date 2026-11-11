import unittest

from app import create_app


class VoiceTubeAppTests(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def test_home_page(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Voice2Tube", response.data)
        self.assertIn(b"typedCommand", response.data)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")

    def test_email_requires_command(self):
        response = self.client.post("/agent", json={"command": ""})
        self.assertEqual(response.status_code, 400)

    def test_youtube_requires_command(self):
        response = self.client.post("/youtube/play", json={"command": ""})
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
