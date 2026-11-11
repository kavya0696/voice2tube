import unittest

from app import create_app


class Voice2TubeAppTests(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def test_home_page(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Voice2Tube", response.data)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["service"], "Voice2Tube")

    def test_search_requires_query(self):
        response = self.client.post("/api/search", json={"query": "  "})
        self.assertEqual(response.status_code, 400)

    def test_search_rejects_long_query(self):
        response = self.client.post("/api/search", json={"query": "x" * 201})
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
